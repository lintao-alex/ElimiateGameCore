/**
 * Created by lintao_alex on 2017/8/23.
 */


namespace game{
    import RemoveElement = staticdata.RemoveElement;
    import staticSkill = staticdata.staticSkill;
    import StaticData = staticdata.StaticData;

    export class TableMaker{
        static GEM_NUM:number = 6;
        static COLUMN_NUM:number = 9;
        static ROW_NUM:number = 7;
        private _cellTable:CellInfo[][];
        private _gemElementList:RemoveElement[];
        private _skillElementList:RemoveElement[];

        public isOutSide(pos:Vec):boolean{
            return pos.x < 0 || pos.x >= TableMaker.COLUMN_NUM || pos.y < 0 || pos.y >= TableMaker.ROW_NUM;
        }
        public isSidePos(pos:Vec):boolean{
            return pos.x==0 || pos.y==0 || pos.x==TableMaker.COLUMN_NUM-1 || pos.y==TableMaker.ROW_NUM-1;
        }
        public isNear(cellA:CellInfo, cellB:CellInfo):boolean{
            if(cellA.columnIndex==cellB.columnIndex) {
                return Math.abs(cellA.rowIndex - cellB.rowIndex)==1;
            }else if(cellA.rowIndex==cellB.rowIndex){
                return Math.abs(cellA.columnIndex - cellB.columnIndex)==1;
            }
        }

        public constructor(){
            this._gemElementList = [];
            this._skillElementList = [];
            let map = StaticData.mapRemoveElement;
            let iter = map.values();
            let cnt:number = 0;
            for(let check = iter.next(); !check.done; check = iter.next(), cnt++){
                if(cnt<TableMaker.GEM_NUM){
                    this._gemElementList.push(check.value);
                }else{
                    this._skillElementList.push(check.value);
                }
            }
            this.initTable()
        }

        private initTable(){
            this._cellTable = [];
            for(let y=0; y<TableMaker.ROW_NUM; y++){
                let cellList = [];
                this._cellTable[y] = cellList;
                for(let x=0; x<TableMaker.COLUMN_NUM; x++){
                    cellList[x] = new CellInfo(x, y)
                }
            }
            this.randomTable();
        }

        public randomTable(){
            let lastRvs: RdCnt[] = [];
            for (let columnIndex = 0; columnIndex < TableMaker.COLUMN_NUM; ++columnIndex) {
                lastRvs[columnIndex] = ObjectPool.getObj(RdCnt);
            }
            let lastCV: RdCnt = ObjectPool.getObj(RdCnt);
            for(let rowIndex = 0; rowIndex < TableMaker.ROW_NUM; ++rowIndex) {
                lastCV.clear();
                let cellList: CellInfo[] = this._cellTable[rowIndex];
                for (let columnIndex = 0; columnIndex < TableMaker.COLUMN_NUM; ++columnIndex) {
                    let lastRv = lastRvs[columnIndex];
                    let tempV: number = this.getRandomGemIndex();
                    lastCV.check(tempV);
                    if(lastCV.isEnough){
                        tempV = this.getRandomGemBut(tempV);
                        lastCV.check(tempV);
                    }
                    lastRv.check(tempV);
                    if(lastRv.isEnough){
                        tempV = this.getRandomGemBut(tempV);
                        lastRv.check(tempV);
                        lastCV.check(tempV);
                    }
                    let cell = cellList[columnIndex];
                    if(cell.content){
                        ObjectPool.recycleObj(cell.content);
                    }
                    tempV = this._gemElementList[tempV].id;
                    cell.__updateContent(this.createGem(tempV));
                }
            }
            ObjectPool.recycleObj(lastCV);
            for (let i = lastRvs.length - 1; i >= 0; i--) {
                ObjectPool.recycleObj(lastRvs[i]);
            }
        }

        private getRandomGemIndex():number{
            let out = MathUtils.getRandomInt(TableMaker.GEM_NUM);
            return out;
        }

        private getRandomGemBut(v:number):number{
            let out = v + 1;
            if(out>=TableMaker.GEM_NUM){
                return out - TableMaker.GEM_NUM;
            }else{
                return out;
            }
        }

        private createGem(id:number):GemInfo{
            let out = ObjectPool.getObj(GemInfo);
            out.__setCore(this);
            out.__setId(id)
            return out;
        }

        private createSkill(element:RemoveElement):CellSkill{
            let out = ObjectPool.getObj(CellSkill);
            out.__setCore(this);
            out.__setId(element.id);
            let skill = staticSkill(element.skillId);
            out.__setSkill(skill);
            return out;
        }

        public getGoodGem(orgPos:Vec, referFallVec:Vec):GemInfo{
            return this.createGem(this.getGoodGemId(orgPos, referFallVec));
        }
        public getSkill(element:RemoveElement):CellSkill{
            return this.createSkill(element);
        }

        private getGoodGemId(orgPos:Vec, referFallVec:Vec):number{
            let index = this.getRandomGemIndex();
            let out = this._gemElementList[index].id;
            let findPos = orgPos.clone();
            let findDir = referFallVec.clone().normal();
            findDir.turnLeft();
            findPos.add(findDir);
            if(!this.isOutSide(findPos)){
                var cell1 = this.getCellByPos(findPos);
                if(cell1.isAble && (cell1.content instanceof GemInfo)){
                    findPos.add(findDir);
                    if(!this.isOutSide(findPos)){
                        var cell2 = this.getCellByPos(findPos);
                        if(cell2.isAble && cell1.content.isSame(cell2.content)){
                            out = cell1.content.id
                        }
                    }
                }
            }
            findDir.reverse();
            findPos.copyFrom(orgPos).add(findDir);
            if(!this.isOutSide(findPos)){
                var cell3 = this.getCellByPos(findPos);
                if(cell3.isAble && (cell3.content instanceof GemInfo)){
                    findPos.add(findDir);
                    if(!this.isOutSide(findPos)){
                        var cell4 = this.getCellByPos(findPos);
                        if(cell4.isAble && cell3.content.isSame(cell4.content)){
                            out = cell3.content.id;
                        }else if(cell1 && cell1.isAble && cell1.content.isSame(cell3.content)){
                            out = cell1.content.id;
                        }
                    }
                }
            }

            ObjectPool.recycleObj(findPos);
            ObjectPool.recycleObj(findDir);
            return out
        }

        public getCellByPos( pos:Vec):CellInfo{
            return this._cellTable[pos.y][pos.x];
        }
        public getCell(x:number, y:number):CellInfo{
            return this._cellTable[y][x];
        }

        get cellTable():game.CellInfo[][]{
            return this._cellTable;
        }


        //deubg
        private SAVE_KEY:string = 'gemList';
        public saveGemList(){
            let gemIdList = [];
            for(let y=0; y<TableMaker.ROW_NUM; ++y){
                for(let x=0; x<TableMaker.COLUMN_NUM; ++x){
                    gemIdList.push(this._cellTable[y][x].content.id)
                }
            }
            let storageValue = JSON.stringify( gemIdList );
            egret.localStorage.setItem( this.SAVE_KEY, storageValue );
            console.log("save by", storageValue);
        }

        public reloadGemList(){
            let configGemNum:number = 6;
            let storageValue = egret.localStorage.getItem( this.SAVE_KEY );
            let eleIdList:number[];
            eleIdList = JSON.parse(storageValue);
            eleIdList = [
                0,2,2,3,2,2,3,2,5,
                1,5,5,4,3,1,4,3,0,
                1,2,2,3,2,2,1,0,2,
                4,3,5,2,1,3,11,6,4,
                2,0,1,2,3,2,2,4,0,
                1,6,6,4,6,1,0,7,3,
                4,2,4,3,4,5,0,1,2];
            for(let y=0; y<TableMaker.ROW_NUM; ++y){
                for(let x=0; x<TableMaker.COLUMN_NUM; ++x){
                    let cell = this._cellTable[y][x];
                    if(cell.content){
                        ObjectPool.recycleObj(cell.content);
                    }
                    let eleId = eleIdList.shift();
                    if(eleId<configGemNum){
                        let gemEle = this._gemElementList[eleId];
                        cell.__updateContent(this.createGem(gemEle.id));
                    }else{
                        let skillEle = this._skillElementList[eleId-configGemNum];
                        cell.__updateContent(this.createSkill(skillEle));
                    }
                }
            }
        }
    }

    export class RdCnt{
        public value: number=-10;
        public cnt: number=0;

        public clear(){
            this.value = -10;
            this.cnt = 0;
        }

        public check(newV:number){
            if(newV==this.value){
                this.cnt++;
            }else{
                this.value = newV;
                this.cnt = 1;
            }
        }

        public get isEnough():boolean{
            return this.cnt > 2;
        }

        public get attention():boolean{
            return this.cnt >= 2;
        }
    }
}