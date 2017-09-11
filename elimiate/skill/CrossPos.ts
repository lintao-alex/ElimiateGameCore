///<reference path="SearchPos.ts"/>
/**
 * Created by lintao_alex on 2017/8/30.
 */
namespace game{
    export class CrossPos extends SearchPos{
        public collectCell(center:Vec, core:TableMaker, collection:ElimiateCellCollection){
            this.getCellsOnDir(center, Vec.LEFT, core, collection);
            this.getCellsOnDir(center, Vec.RIGHT, core, collection);
            this.getCellsOnDir(center, Vec.UP, core, collection);
            this.getCellsOnDir(center, Vec.DOWN, core, collection);
        }
    }
}