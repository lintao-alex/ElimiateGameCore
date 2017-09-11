/**
 * Created by lintao_alex on 2017/8/10.
 */

namespace game{
    import Event = egret.Event;

    export class ElimiateEvent extends Event{
        /**
         * data直接为配置数据对象，若为空表示combo结束
         */
        public static COMBO:string = "ElimiateEvent.COMBO";

        public static ELIMIATE_CELLS:string = "ElimiateEvent.ELIMIATE_CELLS";
        public static REFRESH_CONTENT:string = "ElimiateEvent.REFRESH_CONTENT";
        public static CONTENT_FALL:string = "ElimiateEvent.CONTENT_FALL";
        public static SKILL_APPEAR:string = "ElimiateEvent.SKILL_APPEAR";
        public static CONTENT_SWITCH:string = "ElimiateEvent.CONTENT_SWITCH";

        public constructor(type: string, bubbles?: boolean, cancelable?: boolean, data?: any){
            super( type, bubbles, cancelable, data );
        }
    }
}