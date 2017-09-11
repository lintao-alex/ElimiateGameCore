/**
 * Created by lintao_alex on 2017/9/4.
 */
namespace game{
    export abstract class SkillMovie{
        public abstract deal(target:Image, elimiateList:Image[], endCall:Function, endObj:any, endArgs?:any[]);
    }
}