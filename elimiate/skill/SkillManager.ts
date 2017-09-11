/**
 * Created by lintao_alex on 2017/8/30.
 */


namespace game{
    import staticRemoveElement = staticdata.staticRemoveElement;
    import staticSkill = staticdata.staticSkill;
    import RemoveElement = staticdata.RemoveElement;

    export class SkillManager{
        private _elimiateBuildingMap:Map<number, BuildingInfo>;

        private constructor(){
            this.initBuildingMap();
        }

        private initBuildingMap(){
            this._elimiateBuildingMap = new Map<number, BuildingInfo>();
            BuildingModel.instance.buildingMap.forEach((bInfo:BuildingInfo)=>{
                if(bInfo.cfg.skill>0){
                    let skill = staticSkill(bInfo.cfg.skill);
                    this._elimiateBuildingMap.set(skill.triggerValue, bInfo);
                }
            }, this)
        }

        public getElementByElimiateNum(num:number):RemoveElement{
            let build = this._elimiateBuildingMap.get(num);
            if(build){
                if(Math.random()<=build.skillRate){
                    let skill = staticSkill(build.cfg.skill);
                    if(Math.random()*1000<=skill.triggerProbability){
                        return staticRemoveElement(skill.removeSkillTypeId);
                    }
                }
            }
            return null;
        }

        private static _instance:SkillManager;
        public static get instance():SkillManager{
            if(!SkillManager._instance){
                SkillManager._instance = new SkillManager();
            }
            return SkillManager._instance;
        }
    }

    export enum SkillType{
        OnElimiate = 11,
        AfterElimiate = 12
    }
}