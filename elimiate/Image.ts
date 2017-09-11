/**
 * Created by lintao_alex on 2017/8/10.
 */


namespace game
{
    import Bitmap = egret.Bitmap;
    import Sprite = egret.Sprite;
    import BitmapData = egret.BitmapData;
    import Tween = egret.Tween;
    import Ease = egret.Ease;

    export class Image extends Sprite implements IClear
    {
        private _show:Bitmap;
        private _url:string;
        private _effect:ElimiateEffect;

        private _showRecord:PropertyRecord;

        public constructor(){
            super();
            this._effect = new ElimiateEffect();
            this.addChild(this._effect.view);
            this._effect.view.visible=false;
            this._show = new Bitmap();
            this.addChild( this._show );
            this._showRecord = new PropertyRecord()
        }

        public clear(){
            if(this.parent){
                this.parent.removeChild( this );
            }
            this.clearImg();
            this._effect.stop();
            this._effect.view.visible = false;
            this._showRecord.write(this._show);
            this.alpha = 1;
        }

        public shakeShow(){
            let mvObj = this._show;
            Tween.removeTweens(mvObj);
            this._showRecord.write(mvObj);
            let rHeight:number = this._showRecord.getValue('height');
            let rY:number = this._showRecord.getValue('y');
            let dist:number = rHeight*MathUtils.randomRange(0.1, 0.4);
            Tween.get(mvObj).to({y:rY + dist, height:rHeight - dist}, 100, Ease.quadOut).to({
                y:rY, height:rHeight
            }, 500, Ease.elasticOut);
        }

        public explodeShake(force:Vec){
            let mvObj = this._show;
            Tween.removeTweens(mvObj);
            this._showRecord.write(mvObj);
            let scale = MathUtils.randomRange(2,10);
            Tween.get(mvObj).wait(MathUtils.randomRange(10,90)).to({
                x:mvObj.x + scale * force.x, y:mvObj.y + scale * force.y
            }, 100, Ease.quintOut).to({
                x:this._showRecord.getValue('x'), y:this._showRecord.getValue('y')
            }, 100, Ease.backOut);
        }

        get url():string
        {
            return this._url;
        }

        set url( value:string )
        {
            if(value==this._url){
                return;
            }
            if(value==null || value==""){
                this.clearImg();
            }else {
                this._url = value;
                let bitData = LoadManager.Instance.getRes(this._url);
                this.updateBitData(bitData);
            }
        }

        private updateBitData(bitData:BitmapData){
            this._show.bitmapData = bitData;
            this._show.x = -0.5 * bitData.width;
            this._show.y = -0.5 * bitData.height;
            this._showRecord.read(this._show, 'x');
            this._showRecord.read(this._show, 'y');
            this._showRecord.read(bitData, 'height');
        }

        public clearImg(){
            this._show.bitmapData = null;
            this._url = null;
        }

        public disappear(){
            this.clearImg();
            this._effect.view.visible=true;
            this._effect.play();
        }

        get isShow():boolean{
            return this._show.bitmapData != null;
        }
    }
}