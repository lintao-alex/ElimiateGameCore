/**
 * Created by lintao_alex on 2017/9/5.
 */
namespace game{
    export class GemPos extends SearchPos{
        public collectCell(center:game.Vec, core:game.TableMaker, collection:ElimiateCellCollection){
            this.collectGems(collection.cellList, core);
        }

        private collectGems(out:CellInfo[], core:TableMaker){
            let cnt = out.length;
            let targetGemId = this.skillCfg.removeSkillTypeId;
            let targetNum = this.skillCfg.removeSkillValue;
            for(let y=0; y<TableMaker.ROW_NUM; y++){
                for(let x=0; x<TableMaker.COLUMN_NUM; x++){
                    let info = core.getCell(x, y);
                    if(info.isAble && info.content.id == targetGemId){
                        out.push(info)
                        cnt++;
                        if(cnt>=targetNum){
                            return;
                        }
                    }
                }
            }
        }
    }
}