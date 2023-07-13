import { _decorator, Component, Node, Prefab, instantiate, Label, Vec3 } from 'cc';
import { BLOCK_SIZE, PlayerController } from './PlayerController';
const { ccclass, property, executeInEditMode } = _decorator;

//路面类型，有或无; 这里没给枚举复制，默认从0开始
enum BlockType{
    BT_NONE, //无
    BT_STONE //有
}

//game状态
enum GameState{
    GS_INIT,    //初始化
    GS_PLAYINT, //进行中
    GS_END      //结束
}

@ccclass('GameManager')
// @executeInEditMode(true)
export class GameManager extends Component {

    /** 开始菜单 */
    @property(Node)
    public startMenu: Node|null = null

    /** 角色控制器 */
    @property(PlayerController)
    public playerCtl: PlayerController|null = null

    /** 计步器 */
    @property(Label)
    public stepsLabel: Label|null = null

    /** 属性 - 地板预制 */
    @property(Prefab)
    public floorPerfab: Prefab|null = null

    /** 路面数组 */
    private _road: BlockType[] = []

    /** 路面长度 */
    public roadLenght: number = 50

    start() {
        //初始化
        this.setCurState(GameState.GS_INIT)
    }

    update(deltaTime: number) {
        
    }

    /**
     * 状态为init时的处理
     */
    init() {
        //显示菜单
        if (this.startMenu) {
            this.startMenu.active = true
        }

        //生成路面
        this.genRoad()

        //初始角色
        if (this.playerCtl) {
            //停止按键监听
            this.playerCtl.setInputActive(false)
            //初始化角色位置
            this.playerCtl.node.setPosition(Vec3.ZERO)
            //
            // this.playerCtl.reset()
        }
    }

    /**
     * 进行中
     */
    playint() {
        //隐藏菜单
        if (this.startMenu) {
            this.startMenu.active = false
        }

        //重置计数器
        if (this.stepsLabel) {
            this.stepsLabel.string = '0'
        }

        //激活角色控制,直接设置active会直接开始监听事件，做了一下延迟处理
        setTimeout(() => {
            if (this.playerCtl) {
                this.playerCtl.setInputActive(true)
            }
        }, 0.1)
    }

    /**
     * 根据状态控制
     * 
     * @param state 
     */
    setCurState(state: GameState) {
        switch (state) {
            case GameState.GS_INIT:
                this.init()
                break;
            case GameState.GS_PLAYINT:
                this.playint()
                break;
            case GameState.GS_END:
                break;         
        }
    }

    /**
     * 生成路面
     * - 每次生成时清除上一次的结果
     * - 第一地板不能为空，不然会直接落下去
     * - 由于最高只能跳2格子，所以无路面的块最多只能有2个
     */
    genRoad() {
        //清除上一次结果
        this.node.destroyAllChildren()

        //初始化路面
        this._road = []
        
        //生成路面
        for (let i = 0; i < this.roadLenght; i++) {
            if (i == 0) {
                //第一块路面
                this._road.push(BlockType.BT_STONE)
            } else {
                //随机填充0和1
                this._road.push(Math.floor(Math.random() * 2))
            }
        }

        //填充路面
        for (let j = 0; j < this.roadLenght; j++) {
            let block: Node|null = this.spawnBlockByType(this._road[j]);
            if (block) {
                //添加子节点
                this.node.addChild(block)
                //设置block位置
                block.setPosition(j * BLOCK_SIZE, 0, 0)
            }
        }
    }

    /**
     * 填充路面
     */
    spawnBlockByType(type: BlockType) {
        if (!this.floorPerfab) {
            return null
        }

        let block: Node|null = null;
        if (type == BlockType.BT_STONE) {
            //instantiate: 是 Cocos Creator 提供的克隆预制体的方法。当然它不仅能克隆预制体，你甚至可以用它克隆别的类型比如某个对象
            block = instantiate(this.floorPerfab);
        }
        return block;
    }

    /**
     * 开始按钮点击事件
     */
    onStartButtonClick() {
        //设置进行中
        this.setCurState(GameState.GS_PLAYINT)
    }
}

