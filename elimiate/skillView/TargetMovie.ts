/**
 * Created by lintao_alex on 2017/9/4.
 */
namespace game{
    export class TargetMovie extends SkillMovie{
        private _featherName:string;

        public constructor(name:string){
            super();
            this._featherName = name;
        }

        public deal(target:game.Image, elimiateList:game.Image[], endCall:Function, endObj?:any, endArgs?:any[]){
            FeatherFactory.instance.playOn(this._featherName, target.parent, target.x, target.y);
            TweenManager.instance.get(this).wait(200).call(()=>{
                for(let i = elimiateList.length - 1; i >= 0; i--){
                    let img = elimiateList[i];
                    img.disappear();
                }
                endCall.apply(endObj, endArgs);
            });
        }
    }
}