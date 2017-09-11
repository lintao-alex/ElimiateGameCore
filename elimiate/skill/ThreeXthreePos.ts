/**
 * Created by lintao_alex on 2017/8/30.
 */

namespace game{
    import Rectangle = egret.Rectangle;

    export class ThreeXthreePos extends SearchPos{
        public collectCell(center:game.Vec, core:game.TableMaker, collection:ElimiateCellCollection){
            let rect = Rectangle.create();
            rect.setTo(-1, -1, 2, 2);
            this.getCellsOnRect(center, rect, core, collection);
            Rectangle.release(rect);
        }
    }
}