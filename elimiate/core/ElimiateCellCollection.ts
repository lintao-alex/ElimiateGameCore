/**
 * Created by lintao_alex on 2017/9/5.
 */
namespace game{
    export class ElimiateCellCollection implements IClear{
        public cellList:CellInfo[];
        public reasonCell:CellInfo;
        private _nextList:ElimiateCellCollection[];
        private _prev:ElimiateCellCollection;

        public constructor(){
            this._nextList = [];
        }

        public clear(){
            this._nextList.length = 0;
            this.cellList = null;
            this.reasonCell = null;
            this._prev = null;
        }

        public hasCellInLine(info:CellInfo):boolean{
            let head = this.getHead();
            return head.hasCellInNext(info);
        }

        public hasCellInNext(info:CellInfo):boolean{
            let out = (this.reasonCell == info || this.cellList && this.cellList.indexOf(info) >= 0);
            if(!out && this._nextList){
                for(let i = this._nextList.length - 1; i >= 0; i--){
                    let node = this._nextList[i];
                    out = node.hasCellInNext(info);
                    if(out){
                        return true;
                    }
                }
            }
            return out;
        }

        private getHead():ElimiateCellCollection{
            let out:ElimiateCellCollection = this;
            while(out._prev){
                out = out._prev;
            }
            return out;
        }

        public add(next:ElimiateCellCollection){
            if(next._prev){
                ErrorUtils.throwErr('已经加入其他表')
            }
            if(ArrayUtils.uniquePush(this._nextList, next)){
                next._prev = this;
            }
        }

        public get nextList():ElimiateCellCollection[]{
            return this._nextList;
        }

        public get isEnoughInLine():boolean{
            let head = this.getHead();
            return head.isEnoughInNext;
        }
        public get isEnoughInNext():boolean{
            let out =  this.cellList && this.cellList.length >= GemInfo.OTHER_ELIMIATE_NUM;
            if(!out && this._nextList){
                for(let i = this._nextList.length - 1; i >= 0; i--){
                    let node = this._nextList[i];
                    out = node.isEnoughInNext;
                    if(out){
                        return true;
                    }
                }
            }
            return out;
        }
    }
}