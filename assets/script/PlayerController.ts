import { _decorator, Component, Node, Input, input, EventTouch, EventKeyboard, Vec3, debug, Animation } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

//放大比
export const BLOCK_SIZE = 40

@ccclass('PlayerController')
// @executeInEditMode(true)
export class PlayerController extends Component {

    /** 是否在跳跃状态 */
    private _startJump: boolean = false;

    /** 跳跃步数 */
    private _jumpNum: number = 0;

    /** 跳跃时间： 用于记录整个跳跃的时长 */
    private _jumpTime: number = 0.1;

    /** 当前跳跃时间： 如果这个值超过了_jumpTime表示完成了一次完整跳跃 */
    private _curJumpTime: number = 0;

    /** 移动速度：记录跳跃时的移动速度 */
    private _curJumpSpeed: number = 0;

    /** 当前位置 */
    private _curPos: Vec3 = new Vec3();

    /** 位移 */
    private _deltaPos: Vec3 = new Vec3();

    /** 目标位置 */
    private _targetPos: Vec3 = new Vec3();

    @property(Animation)
    BodyAnim: Animation = null

    start() {
        // this.setInputActive()
    }

    update(deltaTime: number) {
        // console.log('update--');
        // console.log(deltaTime);
        //跳跃状态下
        if (this._startJump == true) {
            //计算当前跳跃时间
            this._curJumpTime += deltaTime
            //判断是否完成了跳跃
            if (this._curJumpTime > this._jumpTime) {
                //完成了跳跃，强制位置移动到终点
                this.node.setPosition(this._targetPos)
                //重置跳跃状态
                this._startJump = false
            } else {
                //未完成跳跃
                //获取当前位置
                this.node.getPosition(this._curPos)
                //计算位移: 速度 * 时间
                this._deltaPos.x = this._curJumpSpeed * deltaTime
                //向量加
                Vec3.add(this._curPos, this._curPos, this._deltaPos)
                //移动位置
                this.node.setPosition(this._curPos)
                // debugger;
            }
        }
    }

    /**
     * 事件回调
     */
    onJumpUp(event: EventKeyboard) {
        if (event.keyCode == 67) {
            //c 键
            this.jumpByStep(1)
        }
    }

    /**
     * 跳跃
     * @param num 跳跃步数
     */
    jumpByStep(num) {
        if (this._startJump == true) {
            //正在跳跃中
            return;
        }

        //设置为跳跃状态
        this._startJump = true;
        this._jumpNum = num;    //跳跃步数
        this._curJumpTime = 0; //重置当前跳跃时间
        this._curJumpSpeed = (this._jumpNum * BLOCK_SIZE) / this._jumpTime;    //速度
        this.node.getPosition(this._curPos);  //当前位置
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpNum * BLOCK_SIZE, 0, 0))  //计算目标位置

        if (this.BodyAnim) {
            this.BodyAnim.play("oneStep")
        }
    }

    /**
     * 按键监听事件激活控制
     */
    setInputActive(active: boolean) {
        if (active) {
            input.on(Input.EventType.KEY_DOWN, this.onJumpUp, this)
        } else {
            input.off(Input.EventType.KEY_DOWN, this.onJumpUp, this)
        }
    }
}

