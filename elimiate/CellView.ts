namespace game{
    import DisplayObject = egret.DisplayObject;

    export class CellView {
        readonly info:CellInfo;
        private _proxyCellBg:DisplayObject;
        private _proxyBgFrame:DisplayObject;
        private _imgX:number;
        private _imgY:number;

        public constructor(info:CellInfo, proxyBg:DisplayObject, bgFrame:DisplayObject){
            this.info = info;
            this._proxyCellBg = proxyBg;
            this._proxyBgFrame = bgFrame;
            bgFrame.visible = false;
        }

        public __initImgPos(x:number, y:number){
            this._imgX = x;
            this._imgY = y;
        }

        public highLight(){
            this._proxyBgFrame.visible = true;
        }
        public removeHighLight(){
            this._proxyBgFrame.visible = false;
        }

        public static getElementUrl(id:number):string{
            let removeE = StaticData.mapRemoveElement.get(id);
            return Config.CELL_URL + removeE.avatar + ".png";
        }

        //property
        get imgY(): number {
            return this._imgY;
        }
        get imgX(): number {
            return this._imgX;
        }
        get columnIndex():number{
            return this.info.columnIndex;
        }
        get rowIndex():number{
            return this.info.rowIndex;
        }
        get isAble():boolean{
            return this.info.isAble;
        }
    }
}