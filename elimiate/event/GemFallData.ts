/**
 * Created by lintao_alex on 2017/8/11.
 */
namespace game{
    export class GemFallData implements IClear{
        public targetList: CellInfo[];
        public fallVec:Vec;

        public clear(){
            this.targetList = null;
            this.fallVec = null;
        }
    }
}