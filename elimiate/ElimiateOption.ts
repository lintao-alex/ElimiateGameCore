namespace game{
    import Sprite = egret.Sprite;
    import TouchEvent = egret.TouchEvent;
    import Tween = egret.Tween;
    import Ease = egret.Ease;

    export class ElimiateOption{
        private _proxyView:ElimiateView;
        private _lastCell:CellView;
        private _touchOffset:Vector2D;
        private _tweenMg:TweenManager;
        private _onMove:boolean=false;

        public constructor(proxyView:ElimiateView){
            this._tweenMg = new TweenManager();
            this._proxyView = proxyView;
            this._touchOffset = new Vector2D();
            this.initOption();
        }

        private initOption(){
            let sp:Sprite = this._proxyView.view;
            sp.touchChildren = false;
            sp.touchEnabled = true;
            sp.addEventListener(TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
            sp.addEventListener(TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            sp.stage.addEventListener(TouchEvent.TOUCH_END, this.onTouchEnd, this);
        }

        private onTouchMove(evt:TouchEvent){
            if(!this._lastCell || !this._lastCell.isAble) return;
            let img = this._proxyView.getImgByView(this._lastCell);
            this._onMove = true;
            let deltaX = evt.localX - this._lastCell.imgX;
            let deltaY = evt.localY - this._lastCell.imgY;
            let absX = Math.abs(deltaX);
            let absY = Math.abs(deltaY);
            if(absX > absY){
                img.x = this._lastCell.imgX + MathUtils.limit(deltaX, -ElimiateView.CELL_WITH, ElimiateView.CELL_WITH);
                img.y = this._lastCell.imgY;
            }else{
                img.y = this._lastCell.imgY + MathUtils.limit(deltaY, -ElimiateView.CELL_HEIGHT, ElimiateView.CELL_HEIGHT);
                img.x = this._lastCell.imgX;
            }
            let nearCell:CellView = this._proxyView.getCellByLocation(evt.localX, evt.localY);
            if(!nearCell.isAble) return;
            if(this._proxyView.isNear(this._lastCell, nearCell)){
                this._proxyView.trySwitch(nearCell, this._lastCell);
                this.optionEnd();
            }
        }

        private optionEnd(){
            if(this._lastCell){
                this._lastCell.removeHighLight();
            }
            this._lastCell = null;
            this._onMove = false;
        }

        private onTouchBegin(evt:TouchEvent){
            let cell: CellView = this._proxyView.getCellByLocation(evt.localX, evt.localY);
            if(!cell.isAble) return;
            this._proxyView.imgToTop(cell);
            if(this._lastCell){
                this._proxyView.trySwitch(cell, this._lastCell);
                this.optionEnd();
            }else{
                cell.highLight()
                this._lastCell = cell;
                this._touchOffset.setTo(cell.imgX - evt.localX, cell.imgY - evt.localY);
            }
        }

        private onTouchEnd(evt:TouchEvent){
            if(!this._lastCell) return;
            if(this._lastCell.isAble && this._lastCell.info.content instanceof CellSkill){
                this._proxyView.useSkill(this._lastCell);
                this.optionEnd();
                return;
            }
            if(!this._onMove) return;
            let img = this._proxyView.getImgByView(this._lastCell);
            if(img){
                Tween.get(img).to({x:this._lastCell.imgX, y:this._lastCell.imgY}, 100, Ease.quintOut);
            }
            this.optionEnd();
        }

    }
}