///<reference path="SkillMovie.ts"/>
/**
 * Created by lintao_alex on 2017/9/5.
 */

namespace game{
    import Ease = egret.Ease;

    export class AttractMovie extends SkillMovie{

        public deal(target:game.Image, elimiateList:game.Image[], endCall:Function, endObj:any, endArgs?:any[]){
            let uiObj = FeatherFactory.instance.playOn("feather_roll", target.parent, target.x, target.y, 't0', -1);
            let cntCall = FunctionUtils.countCall(elimiateList.length - 1, ()=>{
                uiObj.getTransition('t0').stop(true, true);
                endCall.apply(endObj, endArgs);
            });
            let PiRate = 2*Math.PI;
            for(let i = elimiateList.length - 1; i >= 0; i--){
                let img = elimiateList[i];
                if(img == target) continue;
                let dx = img.x - target.x;
                let dy = img.y - target.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                let angle = Math.atan2(dy, dx);
                let targetVr = Math.ceil(dist / 200);
                let tObj = {r:targetVr};
                TweenManager.instance.get(tObj, {loop:false, onChange:()=>{
                    let cAngle = angle + tObj.r * PiRate;
                    let dDist = dist*(tObj.r/targetVr);
                    img.x = target.x + dDist * Math.cos(cAngle);
                    img.y = target.y + dDist * Math.sin(cAngle);
                    // img.rotation = -tObj.r*360;
                }}).to({r:0}, 4*dist, Ease.quintIn).call(cntCall);
            }
        }
    }
}