/**
 * Created by lintao_alex on 2017/8/29.
 */
namespace game{
    export abstract class CellContent implements IClear{
        protected _id:number
        protected _proxyCore:TableMaker;

        public abstract getElimiateCells(center:Vec, except?:Vec, content?:CellContent):ElimiateCellCollection;

        public __setCore(core:TableMaker){
            this._proxyCore = core;
        }

        public __setId(value:number){
            this._id = value;
        }

        public isSame(other:CellContent):boolean{
            return this._id == other._id;
        }

        public clear(){
            this._id = -10;
            this._proxyCore = null;
        }

        get id():number{
            return this._id;
        }
    }
}