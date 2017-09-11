/**
 * Created by lintao_alex on 2017/8/31.
 */
namespace game{
    export class NewSkillData implements IClear{
        public contentList:CellContent[];
        public newSkill:CellSkill;
        public skillTarget:CellContent;

        public clear(){
            this.contentList = null;
            this.newSkill = null;
            this.skillTarget = null;
        }
    }
}