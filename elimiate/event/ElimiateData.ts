/**
 * Created by lintao_alex on 2017/9/4.
 */
namespace game{
    export class ElimiateData implements IClear{
        public contentList:CellContent[];
        public cellList:CellInfo[];
        public skillIndex:number = -1;

        public clear(){
            this.contentList = null;
            this.cellList = null;
            this.skillIndex = -1;
        }
    }
}