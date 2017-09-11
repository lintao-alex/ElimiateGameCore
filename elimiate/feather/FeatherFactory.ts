/**
 * Created by lintao_alex on 2017/8/30.
 */


namespace game{
    import GComponent = fairygui.GComponent;
    import DisplayObjectContainer = egret.DisplayObjectContainer;

    export class FeatherFactory{
        private _pool:Map<any, GComponent[]>;

        public playOn(featherName:string, container:DisplayObjectContainer, x:number, y:number, transName:string='t0', times:number=1):GComponent{
            let uiObj = this.getFeather(featherName);
            let view = uiObj.displayObject;
            view.x = x-0.5*uiObj.packageItem.width;
            view.y = y-0.5*uiObj.packageItem.height;
            container.addChild(view);
            let trans = uiObj.getTransition(transName);
            trans.play(this.recycleFeather, this, uiObj, times);
            return uiObj;
        }

        private getFeather(featherName:string):GComponent{
            let pkg = UIPackage.getByName('main');
            let pkgItem = pkg.getItemByName(featherName);
            let theClass = pkgItem.extensionType;
            let poolList = this.getPoolList(theClass);
            if(poolList.length>0){
                return poolList.pop();
            }else{
                let out = new theClass();
                out.packageItem = pkgItem;
                out.constructFromResource();
                return out;
            }
        }
        private recycleFeather(obj:GComponent){
            let parent = obj.displayObject.parent;
            if(parent){
                parent.removeChild(obj.displayObject);
            }
            let poolList = this.getPoolList((<Object>obj).constructor);
            poolList.push(obj);
        }

        private getPoolList(theClass:any):GComponent[]{
            let poolList = this._pool.get(theClass);
            if(!poolList){
                poolList = [];
                this._pool.set(theClass, poolList);
            }
            return poolList;
        }
        private constructor(){
            this._pool = new Map<any, GComponent[]>();
        }

        static readonly instance = new FeatherFactory();
    }
}