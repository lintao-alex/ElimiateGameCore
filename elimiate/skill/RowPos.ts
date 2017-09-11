///<reference path="SearchPos.ts"/>
/**
 * Created by lintao_alex on 2017/8/29.
 */
namespace game{
    export class RowPos extends SearchPos{
        public collectCell(center:Vec, core:TableMaker, collection:ElimiateCellCollection){
            this.getCellsOnDir(center, Vec.LEFT, core, collection);
            this.getCellsOnDir(center, Vec.RIGHT, core, collection);
        }
    }
}