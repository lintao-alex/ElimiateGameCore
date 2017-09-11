/**
 * Created by lintao_alex on 2017/8/9.
 */


namespace game{
    import EventDispatcher = egret.EventDispatcher;
    import CellInfo = game.CellInfo;
    import StaticData = staticdata.StaticData;
    import RemoveCombo = staticdata.RemoveCombo;

    export class ElimiateCore extends EventDispatcher{
        private _maker:TableMaker;
        private _proxyTable:CellInfo[][];
        private _tweenMg:TweenManager;

        /**用以检查combo*/
        private _checkFallEvtList:DataBackCall[];

        public isOutSide(pos:Vec):boolean{
            return this._maker.isOutSide(pos);
        }
        public isSidePos(pos:Vec):boolean{
            return this._maker.isSidePos(pos);
        }
        public isNear(cellA:CellInfo, cellB:CellInfo):boolean{
            return this._maker.isNear(cellA, cellB);
        }
        public getCellWith(center:CellInfo, dir:Vec):CellInfo{
            let pos = center.pos.clone().add(dir);
            let out:CellInfo;
            if(!this.isOutSide(pos)){
                out = this.getCellByPos(pos);
            }
            ObjectPool.recycleObj(pos);
            return out;
        }
        public getCellByPos( pos:Vec):CellInfo{
            return this._maker.getCellByPos(pos);
        }
        public getCell(x:number, y:number):CellInfo{
            return this._maker.getCell(x, y);
        }

        private constructor(){
            super();
            this._maker = new TableMaker();
            this._proxyTable = this._maker.cellTable;
            this._tweenMg = new TweenManager();

            this._checkFallEvtList = [];
        }

        private cellsFallAfterElimiate(elimiatedCells:CellInfo[]){
            let searchDir = Vec.DOWN;//这里y轴方向是反的
            let bottomCells = this.getBottomCells( elimiatedCells, searchDir );
            for (let i = bottomCells.length - 1; i >= 0; i--) {
                let target = bottomCells[i];
                let targetPos = target.pos.clone();//被消掉要填入新宝石的格子
                let isFull:boolean=false;
                while(!target.needSupply){
                    targetPos.add(searchDir);
                    if(this.isOutSide(targetPos)) {
                        isFull = true;
                        break;
                    }else{
                        target = this.getCellByPos(targetPos);
                    }
                }
                if(isFull){
                    continue;
                }
                let searchPos = target.pos.clone().add(searchDir);
                let targetList: CellInfo[] = [];
                let hasBreak:boolean = false;
                //找出所有能落下的宝石，并补上新宝石
                while(!this.isOutSide(searchPos)) {
                    let check = this.getCellByPos(searchPos);
                    if (check.isAble) {
                        target = this.getCellByPos(targetPos);
                        target.recordComingContent(check.takeAwayContent());
                        targetList.push(target);
                        targetPos.add(searchDir);
                    }else if(check.comingContent || check.isElimiating){
                        hasBreak = true;
                        break;
                    }
                    searchPos.add(searchDir);
                }
                let fallVec = targetPos.clone().sub(searchPos);
                if(!hasBreak) {
                    while (!this.isOutSide(targetPos)) {
                        target = this.getCellByPos(targetPos);
                        target.recordComingContent(this._maker.getGoodGem(target.pos, fallVec));
                        targetList.push(target);
                        targetPos.add(searchDir);
                    }
                }

                if(targetList.length>0) {
                    this.dispatchFallEvent(targetList, fallVec);
                }
                ObjectPool.recycleObj(targetPos);
                ObjectPool.recycleObj(searchPos);
                ObjectPool.recycleObj(fallVec);
            }
        }

        private dispatchFallEvent(tCellList:CellInfo[], referFall:Vec){
            let fallData: GemFallData = ObjectPool.getObj(GemFallData);
            fallData.targetList = tCellList;
            fallData.fallVec = referFall.clone();
            let evtData: DataBackCall = ObjectPool.getObj(DataBackCall);
            evtData.data = fallData;
            this._checkFallEvtList.push(evtData);
            evtData.resetBackCall(() => {
                for(let i=0, len=tCellList.length; i<len; i++){
                    let tCell = tCellList[i];
                    tCell.replaceToComing();
                }
                ArrayUtils.remove(this._checkFallEvtList, evtData);
                if(this._checkFallEvtList.length==0){
                    if(this.getSwitchAble()==null){
                        this._maker.randomTable();
                        while(this.getSwitchAble()==null){//没得操作时重置
                            this._maker.randomTable();
                        }
                        this.dispatchEventWith(ElimiateEvent.REFRESH_CONTENT)
                    }
                    this._tweenMg.get(this).wait(500).call(this.checkComboBreak, this);
                }
                this.fallComplete(tCellList, fallData.fallVec);
                ObjectPool.recycleObj(fallData.fallVec);
                ObjectPool.recycleObj(fallData);
                ObjectPool.recycleObj(evtData);
            }, this);
            this.dispatchEventWith(ElimiateEvent.CONTENT_FALL, false, evtData);
        }

        private checkComboBreak():void{
            if(this._checkFallEvtList.length==0){
                //combo结束
                this.dispatchEventWith(ElimiateEvent.COMBO)
            }
        }

        private fallComplete(tCellList:CellInfo[], referFallVec:Vec){
            let unitFallDir = referFallVec.clone().normal();
            let underCell = this.getCellWith(tCellList[0], unitFallDir);
            if(underCell && underCell.needSupply){
                //消了下方的块，出现的空
                this.cellsFallAfterElimiate([underCell]);
            }else{
                let collectionList:ElimiateCellCollection[] = [];
                for(let i=0, len=tCellList.length; i<len; i++) {
                    let tCell = tCellList[i];
                    if(tCell.content instanceof GemInfo){
                        let fallReverse = unitFallDir.clone().reverse();
                        let collection = tCell.content.getElimiateCells(tCell.pos, fallReverse);
                        ObjectPool.recycleObj(fallReverse);
                        collectionList.push(collection);
                        // this.elimiateByCollection(collection);
                    }
                }
                //合并掉落消中相同宝石的组
                for(let i = 0, len = collectionList.length - 1; i < len; i++){
                    let prevC = collectionList[i];
                    let nextC = collectionList[i + 1];
                    if(prevC.reasonCell.content.isSame(nextC.reasonCell.content)){
                        ArrayUtils.uniqueConcat(nextC.cellList, prevC.cellList);
                        ArrayUtils.uniquePush(nextC.cellList, prevC.reasonCell);
                        collectionList[i] = null;
                        ObjectPool.recycleObj(prevC);
                    }
                }
                for(let i=0, len=collectionList.length; i<len; i++){
                    if(collectionList[i]){
                        this.elimiateByCollection(collectionList[i]);
                    }
                }
            }
            ObjectPool.recycleObj(unitFallDir);
        }

        private getBottomCells(cellList:CellInfo[], refReverse:Vec):CellInfo[]{
            let unitDir = refReverse.clone().reverse().normal();
            let posList:Vector2D[] = [];
            for (let i = cellList.length - 1; i >= 0; i--) {
                let cell = cellList[i];
                let pos = cell.pos.clone();
                while(!this.isOutSide(pos)){
                    pos.add(unitDir);
                }
                pos.sub(unitDir);
                let hasSame:boolean=false;
                for (let j = posList.length - 1; j >= 0; j--) {
                    let checkPos = posList[j];
                    if(pos.equal(checkPos)){
                        hasSame = true;
                        break;
                    }
                }
                if(!hasSame){
                    posList.push(pos)
                }else{
                    ObjectPool.recycleObj(pos);
                }
            }
            let out:CellInfo[] = [];
            for (let i = posList.length - 1; i >= 0; i--) {
                let pos = posList[i];
                out.push(this.getCellByPos(pos));
                ObjectPool.recycleObj(pos);
            }
            ObjectPool.recycleObj(unitDir);
            return out;
        }


        public useSkill(theCell:CellInfo){
            if(theCell.isAble && (theCell.content instanceof CellSkill)){
                let collection = theCell.content.getElimiateCells(theCell.pos)
                this.elimiateByCollection(collection);
            }
        }

        public trySwitch(cellA:CellInfo, cellB:CellInfo){
            if(!cellA.isAble || !cellB.isAble) return;
            if(!this.isNear( cellA, cellB )) return;
            let orgGemA = cellA.takeAwayContent();
            let orgGemB = cellB.takeAwayContent();
            cellA.recordComingContent(orgGemB);
            cellB.recordComingContent(orgGemA);
            let evtData: DataBackCall = ObjectPool.getObj(DataBackCall);
            evtData.data = [cellA, cellB];
            evtData.resetBackCall(() => {
                cellA.replaceToComing();
                cellB.replaceToComing();
                if(!this.checkAfterSwitch( cellA, cellB )){
                    cellA.takeAwayContent();
                    cellB.takeAwayContent();
                    cellA.recordComingContent(orgGemA);
                    cellB.recordComingContent(orgGemB);
                    let evtData2: DataBackCall = ObjectPool.getObj(DataBackCall);
                    evtData2.data = [cellB, cellA];
                    evtData2.resetBackCall(() => {
                        cellA.replaceToComing();
                        cellB.replaceToComing();
                        ObjectPool.recycleObj(evtData2);
                        //刚才交换的时候可能有掉落逻辑停在了这里
                        this.cellsFallAfterElimiate([cellA, cellB]);
                    }, this);
                    this.dispatchEventWith(ElimiateEvent.CONTENT_SWITCH, false, evtData2);
                }
                ObjectPool.recycleObj(evtData);
            }, this);
            this.dispatchEventWith( ElimiateEvent.CONTENT_SWITCH, false, evtData );
        }

        //要确保相邻，且能消
        private checkAfterSwitch(cellA:CellInfo, cellB:CellInfo):boolean{
            //非道具优先计算，因为道具选出的格子可能会产生重复
            if(cellA.content instanceof CellSkill){
                if(cellB.content instanceof CellSkill){
                    return this.afterSwitchOneByOne(cellA, cellB);
                }else{
                    return this.afterSwitchOneByOne(cellB, cellA);
                }
            }else{
                return this.afterSwitchOneByOne(cellA, cellB);
            }
        }
        private afterSwitchOneByOne(cellA:CellInfo, cellB:CellInfo):boolean{
            let out = false;
            let exceptDir = cellB.pos.clone().sub(cellA.pos);
            let collection = cellA.content.getElimiateCells(cellA.pos, exceptDir);
            if(collection.isEnoughInLine){
                out = true;
                this.elimiateByCollection(collection);
            }
            if(cellB.isAble){//若A是道具，可能已经把B消了
                exceptDir.reverse();
                let collection2 = cellB.content.getElimiateCells(cellB.pos, exceptDir);
                if(collection2.isEnoughInLine){
                    out = true;
                    this.elimiateByCollection(collection2);
                }
            }
            ObjectPool.recycleObj(exceptDir);
            return out;
        }

        private elimiateByCollection(collection:ElimiateCellCollection){
            if(!collection.isEnoughInLine) return;
            this.walkCollection(collection);
        }

        private walkCollection(collection:ElimiateCellCollection){
            this.elimiateCells(collection.cellList, collection.reasonCell);
            if(collection.nextList){
                for(let i = collection.nextList.length - 1; i >= 0; i--){
                    let node = collection.nextList[i];
                    this.walkCollection(node);
                }
            }
            ObjectPool.recycleObj(collection);
        }

        //应该确保传入的格子都able
        /**
         * @param {game.CellInfo} reasonCell 引发本次消除的格子
         * 若是内容是道具，就不会产生新道具
         * 若是普通宝石，满足条件就会产生道具
         */
        private elimiateCells(cellList:CellInfo[], reasonCell:CellInfo){
            ArrayUtils.uniquePush(cellList, reasonCell);
            let evtData: DataBackCall = ObjectPool.getObj(DataBackCall);
            let contentList:CellContent[] = [];//要保证与cellList一一对应
            let reasonContent = reasonCell.content;//先记下目标，以免后面被拿走
            let skillData:NewSkillData;
            evtData.resetBackCall(() => {
                for (let i = contentList.length - 1; i >= 0; i--) {
                    let content = contentList[i];
                    ObjectPool.recycleObj(content);
                }
                for( let i=0, len=cellList.length; i<len; i++) {
                    let cell = cellList[i];
                    cell.markElimiating(false);
                }
                if(skillData){
                    reasonCell.replaceToComing();
                }
                this.cellsFallAfterElimiate(cellList);
                ObjectPool.recycleObj(evtData.data);
                ObjectPool.recycleObj(evtData);
            }, this);

            for( let i=0, len=cellList.length; i<len; i++){
                let cell = cellList[i];
                cell.markElimiating(true);
                let cellC: CellContent = cell.takeAwayContent();
                if(cellC==null){
                    ErrorUtils.throwErr('要消空格子');
                }
                contentList[i] = cellC;
            }
            if(!(reasonContent instanceof CellSkill)){//非道具消的才可能出现道具
                let element = SkillManager.instance.getElementByElimiateNum(cellList.length);
                if(element){
                    skillData = ObjectPool.getObj(NewSkillData);
                    skillData.contentList = contentList;
                    skillData.newSkill = this._maker.getSkill(element);
                    skillData.skillTarget = reasonContent;
                    reasonCell.recordComingContent(skillData.newSkill);
                }
            }
            if(skillData){
                evtData.data = skillData;
                this.dispatchEventWith(ElimiateEvent.SKILL_APPEAR, false, evtData);
            }else{
                evtData.data = ObjectPool.getObj(ElimiateData);
                evtData.data.cellList = cellList.concat();
                evtData.data.contentList = contentList.concat();
                if(reasonContent instanceof CellSkill){
                    evtData.data.skillIndex = cellList.indexOf(reasonCell);
                }
                this.dispatchEventWith(ElimiateEvent.ELIMIATE_CELLS, false, evtData);
            }

            let comboCfg:RemoveCombo = ArrayUtils.getFromMap(StaticData.mapRemoveCombo, ["removeNumber", cellList.length]);
            if(comboCfg){
                this.dispatchEventWith(ElimiateEvent.COMBO, false, comboCfg);
            }
        }

        private static _instance:ElimiateCore;
        public static get instance():ElimiateCore{
            if(ElimiateCore._instance==null){
                ElimiateCore._instance = new ElimiateCore();
            }
            return ElimiateCore._instance;
        }

        public saveGemList(){
            this._maker.saveGemList();
        }
        public reloadGemList(){
            this._maker.reloadGemList();
            this.dispatchEventWith(ElimiateEvent.REFRESH_CONTENT)
        }


        public startAutoElimiate(){
            this.addEventListener(ElimiateEvent.COMBO, this.onComboEnd, this);
            this.searchElimiate();
        }

        private onComboEnd(evt:ElimiateEvent){
            if(evt.data) return;
            this.searchElimiate();
        }
        private searchElimiate(){
            let cells = this.getSwitchAble();
            if(cells){
                this.trySwitch(cells[0], cells[1]);
            }
        }

        private getSwitchAble():[CellInfo, CellInfo]{
            for (let y = this._proxyTable.length - 1; y >= 0; y--) {
                let cellList = this._proxyTable[y];
                for (let x = cellList.length - 2; x >= 0; x--) {
                    let cell = cellList[x];
                    let nextCell = cellList[x + 1];
                    if(this.checkSwitch(cell, nextCell)){
                        return [cell, nextCell];
                    }
                }
            }

            for (let y = this._proxyTable.length - 2; y >= 0; y--) {
                let cellList = this._proxyTable[y];
                for (let x = cellList.length - 1; x >= 0; x--) {
                    let cell = cellList[x];
                    let nextCell = this._proxyTable[y+1][x];
                    if(this.checkSwitch(cell, nextCell)){
                        return [cell, nextCell];
                    }
                }
            }
            return null;
        }

        private checkSwitch(cellA:CellInfo, cellB:CellInfo):boolean{
            if(!(cellA.isAble && cellB.isAble)) return false;
            if(cellA.content.isSame(cellB.content)) return false;
            let exceptDir = cellB.pos.clone().sub(cellA.pos);
            let collection = cellA.content.getElimiateCells(cellA.pos, exceptDir, cellB.content);
            if(collection.isEnoughInLine){
                ObjectPool.recycleObj(exceptDir);
                return true;
            }
            exceptDir.reverse();
            collection = cellB.content.getElimiateCells(cellB.pos, exceptDir, cellA.content);
            ObjectPool.recycleObj(exceptDir);
            return collection.isEnoughInLine;
        }

        public debugElimiate(){
            // let cList:CellInfo[] = []
            // cList.push(this.getCell(0,4))
            // cList.push(this.getCell(0,3))
            // cList.push(this.getCell(0,6))
            // this.elimiateCells(cList);
        }
    }
}