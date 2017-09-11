/**
 * Created by lintao_alex on 2017/8/29.
 */


namespace game{
    import Skill = staticdata.Skill;

    export class CellSkill extends CellContent{
        private static _searchMap:Map<number, [SearchPos, SkillMovie]>;
        private static getSearch(id:number):[SearchPos, SkillMovie]{
            if(!CellSkill._searchMap){
                let map = new Map<number, [SearchPos, SkillMovie]>();
                CellSkill._searchMap = map;
                map.set(110001, [new ColumnPos(), new TargetMovie("explode_column")]);
                map.set(110002, [new RowPos(), new TargetMovie("explode_row")]);
                map.set(110003, [new ThreeXthreePos(), new TargetMovie("explode_small")]);
                map.set(110004, [new FiveXfivePos(), new TargetMovie("explode_big")]);
                map.set(110005, [new CrossPos(), new TargetMovie("explode_cross")]);
                map.set(110006, [new GemPos(), new AttractMovie()]);

                // map.set(110001, new ThreeXthreePos());
                // map.set(110002, new FiveXfivePos());
            }
            return CellSkill._searchMap.get(id);
        }

        public __setId(value:number){
            if(value<20001){
                ErrorUtils.throwErr('道具Id错误')
            }
            super.__setId(value);
        }

        private _skillCfg:Skill;
        public __setSkill(theSkill:Skill){
            this._skillCfg = theSkill;
        }
        public getElimiateCells(center:Vec, except?:Vec, content?:CellContent):ElimiateCellCollection{
            let pos:SearchPos = CellSkill.getSearch(this._skillCfg.id)[0];
            pos.updateCfg(this._skillCfg);
            let out:ElimiateCellCollection = ObjectPool.getObj(ElimiateCellCollection);
            out.cellList = [];
            out.reasonCell = this._proxyCore.getCellByPos(center);
            pos.collectCell(center, this._proxyCore, out);
            return out;
        }

        public __leadFromSkill(center:Vec, collection:ElimiateCellCollection){
            let pos:SearchPos = CellSkill.getSearch(this._skillCfg.id)[0];
            pos.updateCfg(this._skillCfg);
            pos.collectCell(center, this._proxyCore, collection);
        }


        public clear():any{
            this._skillCfg = null;
            super.clear();
        }

        public dealViewFeather(target:Image, elimiateList:Image[], endCall:Function, endObj?:any){
            let movie:SkillMovie = CellSkill.getSearch(this._skillCfg.id)[1];
            movie.deal(target, elimiateList, endCall, endObj);
        }
    }
}