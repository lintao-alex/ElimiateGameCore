///<reference path="SearchPos.ts"/>
/**
 * Created by lintao_alex on 2017/8/30.
 */

namespace game{
    import Rectangle = egret.Rectangle;

    export class FiveXfivePos extends SearchPos{
        public collectCell(center:game.Vec, core:game.TableMaker, collection:ElimiateCellCollection){
            let rect = Rectangle.create();
            rect.setTo(-2, -2, 4, 4);
            this.getCellsOnRect(center, rect, core, collection);
            Rectangle.release(rect);
        }
    }
}