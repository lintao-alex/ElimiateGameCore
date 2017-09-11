///<reference path="../../../../ui/main/UI_elimiate_effect.ts"/>
/**
 * Created by lintao_alex on 2017/8/23.
 */


namespace game{
    import DisplayObject = egret.DisplayObject;
    import UI_elimiate_effect = game.main.UI_elimiate_effect;
    import UI_elimiate_effect_one = game.main.UI_elimiate_effect_one;

    export class ElimiateEffect{
        private _uiObj:UI_elimiate_effect;
        public constructor(){
            this._uiObj = UI_elimiate_effect.createInstance();
        }

        public play(delay:number=0){
            for (let i = 0; i < 8; i++) {
                let one:UI_elimiate_effect_one = this._uiObj['mv'+i];
                one.move.play(null,null,null,1,delay);
            }
        }

        public stop(){
            for (let i = 0; i < 8; i++) {
                let one:UI_elimiate_effect_one = this._uiObj['mv'+i];
                one.move.stop(true)
            }
        }

        public get view():DisplayObject{
            return this._uiObj.displayObject;
        }
    }
}