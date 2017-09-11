/**
 * Created by lintao_alex on 2017/8/10.
 */


namespace game
{
    export class CellInfo
    {
        private _content:CellContent;
        private _comingContent:CellContent;
        readonly pos:Vec;

        /**
         * gem与comingGem都为空有两种情况
         * 1.正在爆炸
         * 2.掉落巡查逻辑被打断，上面的宝石被拿走而没有补充
         */
        private _isElimiating:boolean=false;

        public constructor(column, row){
            this.pos = new Vec(column, row);
        }

        public __updateContent(newContent:CellContent){
            if(newContent==null){
                ErrorUtils.throwErr("不要空宝石");
            }
            if(this._comingContent){
                ErrorUtils.throwErr("正在等待");
            }
            this._content = newContent;
            this._comingContent = null;
        }

        public takeAwayContent():CellContent{
            let out:CellContent = this._content;
            this._content = null;
            return out;
        }

        public recordComingContent(newContent:CellContent){
            if(this._content){
                ErrorUtils.throwErr('名花有主');
            }
            this._comingContent = newContent;
        }

        public replaceToComing(){
            if(!this._comingContent){
                ErrorUtils.throwErr('未有来者');
            }
            this._content = this._comingContent;
            this._comingContent = null;
        }

        public markElimiating(value:boolean){
            this._isElimiating = value;
        }

        //property
        public get isAble():boolean{
            return this._content!=null;//gem 与 comingGem 不会同时有值
        }

        public get needSupply():boolean{
            return !this._content && !this._comingContent && !this._isElimiating;
        }

        public get content():CellContent{
            return this._content;
        }

        public get isElimiating():boolean{
            return this._isElimiating;
        }

        public get comingContent():CellContent{
            return this._comingContent;
        }

        public get columnIndex():number{
            return this.pos.x;
        }

        public get rowIndex():number{
            return this.pos.y;
        }
    }
}