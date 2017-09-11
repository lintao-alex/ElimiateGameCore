///<reference path="CellContent.ts"/>
namespace game{
    export class GemInfo extends CellContent{
        static readonly OTHER_ELIMIATE_NUM:number = 2;

        public __setId(value:number){
            // if(value>10006){
            //     ErrorUtils.throwErr('宝石Id错误')
            // }
            super.__setId(value);
        }

        /***
         * @param {game.Vec} center 起点坐标
         * @param {game.Vec} except 不必检查的方向
         * @param {game.CellContent} content 指定匹配内容
         * @returns {game.CellInfo[]}
         */
        public getElimiateCells(center:Vec, except?:Vec, content?:CellContent):ElimiateCellCollection{
            if(!content){
                content = this;
            }
            let dir:Vector2D;
            let line1:CellInfo[];
            if(except){
                dir = except.clone().normal();
                line1 = []
            }else{
                dir = Vec.UP.clone();
                line1 = this.getSameOn(center, dir, content);
            }
            dir.reverse();
            this.getSameOn(center, dir, content, line1);

            dir.turnLeft();
            let line2 = this.getSameOn(center, dir, content);
            dir.reverse();
            this.getSameOn(center, dir, content, line2);
            ObjectPool.recycleObj(dir);

            let list:CellInfo[];
            if(line1.length>=GemInfo.OTHER_ELIMIATE_NUM){
                list = line1;
            }
            if(line2.length>=GemInfo.OTHER_ELIMIATE_NUM){
                if(list){
                    ArrayUtils.concat(list, line2);
                }else{
                    list = line2;
                }
            }

            let out = ObjectPool.getObj(ElimiateCellCollection);
            out.reasonCell = this._proxyCore.getCellByPos(center);
            if(list){
                out.cellList = list;
            }else{
                out.cellList = [];
            }
            return out;
        }

        private getSameOn(center:Vec, refDir:Vec, content?:CellContent, out:CellInfo[]=null):CellInfo[]{
            if(out==null) out = [];
            if(!content) content = this;
            let searchPos = center.clone();
            searchPos.add(refDir);
            while (!this._proxyCore.isOutSide(searchPos)) {
                let cell = this._proxyCore.getCellByPos(searchPos);
                if(cell.isAble && content.isSame(cell.content)){
                    out.push(cell)
                    searchPos.add(refDir);
                }else{
                    break;
                }
            }
            ObjectPool.recycleObj(searchPos);
            return out;
        }
    }
}