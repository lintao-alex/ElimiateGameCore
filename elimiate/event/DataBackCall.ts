namespace game{
    export class DataBackCall implements IClear{
        public data:any;
        private _backFuc:Function;
        private _backObj:any;
        private _backParams:any[];

        public resetBackCall(fuc:Function, obj:any, ...params){
            this._backFuc = fuc;
            this._backObj = obj;
            this._backParams = params;
        }

        public callBack(){
            this._backFuc.apply(this._backObj, this._backParams);
        }

        public clear(){
            this.data = null;
            this._backFuc = null;
            this._backObj = null;
            this._backParams = null;
        }
    }
}