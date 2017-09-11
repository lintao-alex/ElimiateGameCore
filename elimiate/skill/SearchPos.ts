/**
 * Created by lintao_alex on 2017/8/29.
 */


namespace game{
    import Rectangle = egret.Rectangle;
    import Skill = staticdata.Skill;

    export abstract class SearchPos{
        private _skillCfg:Skill;

        public updateCfg(cfg:Skill){
            this._skillCfg = cfg;
        }

        protected get skillCfg():Skill{
            return this._skillCfg;
        }
        public abstract collectCell(center:Vec, core:TableMaker, collection:ElimiateCellCollection);

        private pushCell(cell:CellInfo, collection:ElimiateCellCollection){
            if(!cell.isAble || collection.hasCellInLine(cell)) return;
            let content = cell.content;
            if(content instanceof CellSkill){
                let next = ObjectPool.getObj(ElimiateCellCollection);
                collection.add(next);
                next.cellList = [];
                next.reasonCell = cell;
                content.__leadFromSkill(cell.pos, next);
            }else{
                collection.cellList.push(cell);
            }
        }

        protected getCellsOnDir(center:Vec, refDir:Vec, core:TableMaker, collect:ElimiateCellCollection){
            let searchPos = center.clone().add(refDir);
            while(!core.isOutSide(searchPos)){
                let cell = core.getCellByPos(searchPos);
                this.pushCell(cell, collect);
                searchPos.add(refDir);
            }
            ObjectPool.recycleObj(searchPos);
        }

        protected getCellsOnRect(center:Vec, rect:Rectangle, core:TableMaker, collect:ElimiateCellCollection){
            let searchPos:Vector2D = ObjectPool.getObj(Vector2D);
            for(let y=rect.y+center.y, endY=rect.bottom+center.y; y<=endY; y++){
                for(let x=rect.x+center.x, endX=rect.right+center.x; x<=endX; x++){
                    searchPos.setTo(x, y);
                    if(core.isOutSide(searchPos)) continue;
                    let cell = core.getCellByPos(searchPos);
                    this.pushCell(cell, collect);
                }
            }
            ObjectPool.recycleObj(searchPos);
        }

    }
}