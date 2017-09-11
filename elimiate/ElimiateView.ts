/**
 * Created by lintao_alex on 2017/8/9.
 */


namespace game{
    import Sprite = egret.Sprite;
    import Ease = egret.Ease;
    import Rectangle = egret.Rectangle;
    import DisplayObject = egret.DisplayObject;
    import Bitmap = egret.Bitmap;
    import RemoveDropTime = staticdata.RemoveDropTime;
    import StaticData = staticdata.StaticData;

    export class ElimiateView{
        static readonly bgUrl:string = Config.CELL_URL+'bg.png';
        static readonly bgFrameUrl:string = Config.CELL_URL+'bg_frame.png';
        static readonly CELL_WITH:number = 80;
        static readonly CELL_HEIGHT:number = 80;

        get view():egret.Sprite {
            return this._view;
        }
        get width():number{
            return ElimiateView.CELL_WITH * TableMaker.COLUMN_NUM;
        }
        get height():number{
            return ElimiateView.CELL_HEIGHT * TableMaker.ROW_NUM;
        }

        private _view:Sprite;
        private _viewTable:CellView[][];
        private _core:ElimiateCore;
        private _tweenMg:TweenManager;
        private _option:ElimiateOption;

        private _contentImgMap:Map<CellContent, Image>

        public constructor(){
            this._contentImgMap = new Map<CellContent, Image>();
            this._view = new Sprite();
            this._view.scrollRect = new Rectangle(0, 0, this.width, this.height);
            this.openDebug();
            this._tweenMg = new TweenManager();
            this._core = ElimiateCore.instance;

            this._core.addEventListener( ElimiateEvent.SKILL_APPEAR, this.onSkillAppear, this );
            this._core.addEventListener( ElimiateEvent.ELIMIATE_CELLS, this.beforeElimiateCells, this );
            this._core.addEventListener( ElimiateEvent.REFRESH_CONTENT, this.onRefreshContent, this );
            this._core.addEventListener( ElimiateEvent.CONTENT_SWITCH, this.onContentSwitch, this );
            this._core.addEventListener( ElimiateEvent.CONTENT_FALL, this.onContentFall, this );

            this.createTable();
        }

        public useSkill(view:CellView){
            this._core.useSkill(view.info);
        }

        //移至顶层
        public imgToTop(view:CellView){
            if(!view.isAble) return;
            let img = this._contentImgMap.get(view.info.content);
            this._view.setChildIndex(img, this._view.numChildren - 1);
        }

        private onContentSwitch(evt:ElimiateEvent){
            let evtData: DataBackCall = evt.data;
            let moveTime: number = 100;
            let infoA:CellInfo = evtData.data[0];
            let infoB:CellInfo = evtData.data[1];
            let viewA = this.getViewByInfo(infoA);
            let viewB = this.getViewByInfo(infoB);
            let comingImgA = this._contentImgMap.get(infoA.comingContent);
            let comingImgB = this._contentImgMap.get(infoB.comingContent);
            if(comingImgB==null || comingImgA==null){
                console.warn( '没有显示的宝石' );
                return;
            }
            let cntCall: Function = FunctionUtils.countCall(2, evtData.callBack, evtData);
            this._tweenMg.get(comingImgB).to({
                x: viewB.imgX, y: viewB.imgY
            }, moveTime).call(cntCall);
            this._tweenMg.get(comingImgA).to({
                x: viewA.imgX, y: viewA.imgY
            }, moveTime).call(cntCall);
        }

        private onContentFall(evt:ElimiateEvent){
            let evtData: DataBackCall = evt.data;
            let fallData:GemFallData = evtData.data;
            let targetList = fallData.targetList;
            let fallVec = fallData.fallVec;
            let cmpCall: Function = FunctionUtils.countCall(targetList.length, evtData.callBack, evtData);
            for(let i=0,len=targetList.length; i<len; i++){
                let cellInfo = targetList[i];
                let targetView = this.getViewByInfo(cellInfo);
                if(!cellInfo.comingContent){
                    ErrorUtils.throwErr('未有来者');
                }
                let img: Image = this._contentImgMap.get(cellInfo.comingContent);
                if(!img){
                    img = this.createImg(cellInfo.comingContent);
                    img.x = targetView.imgX - fallVec.x * ElimiateView.CELL_WITH;
                    img.y = targetView.imgY - fallVec.y * ElimiateView.CELL_HEIGHT;
                    this._view.addChild(img);
                }
                let fallDist = fallData.fallVec.len;
                let dropTime:RemoveDropTime = ArrayUtils.getFromMap(StaticData.mapRemoveDropTime, ["gridNumber", fallDist]);
                this._tweenMg.get(img).wait(i*100).to({
                    x: targetView.imgX, y: targetView.imgY
                }, dropTime.time * 0.1, Ease.quadIn).call(() => {
                    img.shakeShow();
                    if(i==0){
                        this.shakeUnder(cellInfo, fallVec);
                    }
                    cmpCall();
                });
            }
        }

        //下方的宝石也要抖动
        private shakeUnder(cell:CellInfo, fallVec:Vec){
            let unitFall = fallVec.clone().normal();
            let bottomCell = this._core.getCellWith(cell, unitFall);
            if(bottomCell){
                let bottomImg = this._contentImgMap.get(bottomCell.content);
                if(bottomImg){
                    bottomImg.shakeShow();
                }
            }
            ObjectPool.recycleObj(unitFall);
        }

        private elimiateExplode(cellList:CellInfo[]){
            let imgForceMap:Map<Image, Vector2D> = new Map<Image, Vector2D>();
            let addForce = (center:CellInfo, searchDir:Vec)=>{
                let nearCell = this._core.getCellWith(center, searchDir);
                if(!nearCell || !nearCell.isAble) return;
                let nearImg = this._contentImgMap.get(nearCell.content);
                if(!nearImg) return;
                let newForce = nearCell.pos.clone().sub(center.pos);
                let force = imgForceMap.get(nearImg);
                if(force){
                    force.add(newForce);
                    ObjectPool.recycleObj(newForce);
                }else{
                    imgForceMap.set(nearImg, newForce);
                }
            }

            let dir1 = Vec.UP.clone();
            let dir2 = Vec.UP_LEFT.clone();
            for(let i = cellList.length - 1; i >= 0; i--){
                let cell = cellList[i];
                let cnt = 4;
                while(--cnt>=0){
                    addForce(cell, dir1);
                    addForce(cell, dir2);
                    dir1.turnLeft();
                    dir2.turnLeft();
                }
            }
            imgForceMap.forEach((force, img) =>{
                img.explodeShake(force);
                ObjectPool.recycleObj(force);
            }, this);
        }

        private onRefreshContent(evt:ElimiateEvent){
            this._contentImgMap.forEach((img) => {
                ObjectPool.recycleObj(img);
            }, this);
            this._contentImgMap.clear();
            for (let y = this._viewTable.length - 1; y >= 0; y--) {
                let list = this._viewTable[y];
                for (let x = list.length - 1; x >= 0; x--) {
                    let view = list[x];
                    let info = view.info;
                    let img = this.createImg(info.content);
                    img.x = view.imgX;
                    img.y = view.imgY;
                    this._view.addChild(img);
                }
            }
        }

        //查询方法
        private getViewByPos(vec:Vector2D):CellView{
            return this._viewTable[vec.y][vec.x];
        }
        private isOutSide(vec:Vec):boolean{
            return this._core.isOutSide(vec);
        }
        private getViewByInfo(info:CellInfo):CellView{
            return this._viewTable[info.rowIndex][info.columnIndex];
        }

        private onSkillAppear(evt:ElimiateEvent){
            let backCall:DataBackCall = evt.data;
            let skillData:NewSkillData = backCall.data;
            let targetContent:CellContent = skillData.skillTarget;
            let targetImg = this._contentImgMap.get(targetContent);
            let skillImg = this.createImg(skillData.newSkill);
            skillImg.x = targetImg.x;
            skillImg.y = targetImg.y;
            skillImg.alpha = 0;
            this._view.addChild(skillImg);
            let conList = skillData.contentList;
            let cntCall = FunctionUtils.countCall(conList.length+1, backCall.callBack, backCall);
            for(let i = conList.length - 1; i >= 0; i--){
                let con = conList[i];
                let img = this._contentImgMap.get(con);
                if(!img){
                    ErrorUtils.throwErr('找不到对应的图')
                }
                this._contentImgMap.delete(con);
                this._tweenMg.get(img).to({
                    x:targetImg.x, y:targetImg.y
                }, 200, Ease.quadIn).call(() =>{
                    this._tweenMg.get(skillImg).to({alpha:1}, 100).call(cntCall);
                }).to({alpha:0}, 100).call(() =>{
                    ObjectPool.recycleObj(img);
                    cntCall();
                });
            }
        }

        private beforeElimiateCells(evt:ElimiateEvent){
            let evtData: DataBackCall = evt.data;
            let emData:ElimiateData = evtData.data;
            let contentList:CellContent[] = emData.contentList;
            let imgList:Image[] = [];
            let topIndex = this._view.numChildren-1;
            for (let i = contentList.length - 1; i >= 0; i--) {
                let cellC = contentList[i];
                let img = this._contentImgMap.get(cellC);
                if(!img){
                    ErrorUtils.throwErr('找不到要消除的图');
                }
                this._contentImgMap.delete(cellC);
                imgList[i] = img;
                this._view.setChildIndex(img, topIndex);
            }

            let recycleCall:Function = ()=>{
                for(let i = imgList.length - 1; i >= 0; i--){
                    let img = imgList[i];
                    ObjectPool.recycleObj(img);
                }
                evtData.callBack();
            }
            if(emData.skillIndex<0){
                let cntCall: Function = FunctionUtils.countCall(contentList.length, ()=>{
                    this._tweenMg.get(this).wait(500).call(recycleCall);
                });
                for(let i = imgList.length - 1; i >= 0; i--){
                    let img = imgList[i];
                    img.disappear();
                    cntCall();
                }
            }else{
                let skillC = emData.contentList[emData.skillIndex] as CellSkill;
                skillC.dealViewFeather(imgList[emData.skillIndex], imgList, recycleCall);
            }
            this.elimiateExplode(emData.cellList);
        }

        private elimiateCells(evtData:DataBackCall){
            let contentList: CellContent[] = evtData.data[0];
            let cntCall: Function = FunctionUtils.countCall(contentList.length, evtData.callBack, evtData);
            for (let i = contentList.length - 1; i >= 0; i--) {
                let cellC = contentList[i];
                let img = this._contentImgMap.get(cellC);
                if(!img){
                    ErrorUtils.throwErr('找不到要消除的图');
                }
                this._contentImgMap.delete(cellC);
                img.disappear();
                this._tweenMg.get(img).wait(500).call(() => {
                    ObjectPool.recycleObj(img);
                    cntCall();
                }, this);
            }
            this.elimiateExplode(evtData.data[1]);
        }

        public openOption(){
            this._option = new ElimiateOption(this);
        }

        private createTable(){
            this._viewTable = [];
            let offsetX:number = ElimiateView.CELL_WITH * 0.5;
            let offsetY:number = ElimiateView.CELL_HEIGHT * 0.5;
            let imgList: Image[] = [];
            for(let rowIndex = 0; rowIndex < TableMaker.ROW_NUM; rowIndex++){
                let viewList = [];
                this._viewTable[rowIndex] = viewList;
                for(let columnIndex = 0; columnIndex < TableMaker.COLUMN_NUM; columnIndex++){
                    let info = this._core.getCell(columnIndex, rowIndex);
                    let cellBg = this.createCellBg();
                    let bgFrame = this.createCellBgFrame();
                    let view = new CellView(info, cellBg, bgFrame);
                    let cellX:number = ElimiateView.CELL_WITH * columnIndex;
                    let cellY:number = ElimiateView.CELL_HEIGHT * rowIndex;
                    cellBg.width = 76;
                    cellBg.height = 76;
                    cellBg.x = cellX + 2;
                    cellBg.y = cellY + 2;
                    bgFrame.width = 84;
                    bgFrame.height = 84;
                    bgFrame.x = cellX - 2;
                    bgFrame.y = cellY - 2;
                    view.__initImgPos(cellX+offsetX, cellY+offsetY);
                    let img = this.createImg(info.content);
                    img.x = view.imgX;
                    img.y = view.imgY;
                    imgList.push(img);
                    viewList[columnIndex] = view;
                    this._view.addChild(cellBg);
                    this._view.addChild(bgFrame);
                }
            }
            for(let i=0, len=imgList.length; i<len; i++){
                this._view.addChild(imgList[i]);
            }
        }

        private createCellBg():DisplayObject{
            let out = new Bitmap(LoadManager.Instance.getRes(ElimiateView.bgUrl));
            return out;
        }

        private createCellBgFrame():DisplayObject{
            let out = new Bitmap(LoadManager.Instance.getRes(ElimiateView.bgFrameUrl));
            return out;
        }

        public getCellByLocation(x:number, y:number):CellView{
            let columnIndex: number = Math.floor(x / ElimiateView.CELL_WITH);
            let rowIndex: number = Math.floor(y / ElimiateView.CELL_HEIGHT);
            return this._viewTable[rowIndex][columnIndex]
        }

        public isNear(cellA:CellView, cellB:CellView):boolean{
            return this._core.isNear(cellA.info, cellB.info);
        }

        public trySwitch( cellA:CellView, cellB:CellView){
            this._core.trySwitch(cellA.info, cellB.info);
        }

        private createImg(content:CellContent):Image{
            let out: Image = ObjectPool.getObj(Image);
            out.url = CellView.getElementUrl(content.id);
            this._contentImgMap.set(content, out);
            return out;
        }
        //确保格子可用
        public getImgByView(view:CellView):Image{
            let gem = view.info.content;
            return this._contentImgMap.get(gem);
        }

        //deubg
        private _isPaused:boolean=false;
        private openDebug(){
            // KeyboardUtil.getInstance().addKeyUpListener(this.onKey, this)
        }
        private onKey(evt:KeyboardEvent){
            switch(evt.keyCode){
                case Key.Q:
                    this._core.saveGemList();
                    break;
                case Key.W:
                    this._core.reloadGemList();
                    break;
                case Key.E:
                    this._core.debugElimiate();
                    break;
                case Key.A:
                    this._core.startAutoElimiate();
                    break;
                // case Key.Insert:
                //     if(this._isPaused){
                //         this._tweenMg.resumeAll();
                //         this._core.__tweenMg.resumeAll();
                //     }else{
                //         this._tweenMg.paueAll();
                //         this._core.__tweenMg.paueAll();
                //     }
                //     this._isPaused = !this._isPaused;
                //     break;
                // case Key.Delete:
                    // if(this._moveLayer.alpha == 1){
                    //     this._moveLayer.alpha = 0;
                    // }else{
                    //     this._moveLayer.alpha = 1;
                    // }
                    // break;
                // case Key.Q:
                    // for( let i = this._viewTable.length - 1; i >= 0; i-- ) {
                    //     this._viewTable[ i ].refreshImg()
                    // }
                    // break;
                // case Key.W:
                    // this._core.randomTable();
                    // this._core.tryAutoElimiate()
                    // break;
            }
        }
    }
}