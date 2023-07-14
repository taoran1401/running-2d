import { _decorator, Component, Node, Prefab, instantiate, Label, Vec3, ProgressBar, find } from 'cc';
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
@executeInEditMode(true)
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

    /** 结束后展示的label */
    @property(Label)
    public endLabel: Label|null = null

    /** 进度条 Node */
    public progressBarNode: Node|null = null

    /** 进度条 ProgressBar */
    // @property(ProgressBar)
    public progressBar: ProgressBar|null = null

    /** progressBar Label */
    public progressBarLabel: Label|null = null

    /** 路面数组 */
    private _road: BlockType[] = []

    /** 路面长度 */
    public roadLenght: number = 50

    start() {
        //初始化
        this.setCurState(GameState.GS_INIT)
        //这里我们使用的 this.playerCtl?.node 也就是 PlayerController 的节点来接收事件，在 Cocos Creator 中，某个节点派发的事件，只能用这个节点的引用去监听
        this.playerCtl?.node.on('jumpEnd', this.onPlayerJumpEnd, this)
    }

    update(deltaTime: number) {
        
    }

    /**
     * 状态为init时的处理
     */
    init() {
        //隐藏结束弹窗
        let endCanvas = find('EndCanvas')
        if (endCanvas) {
            endCanvas.active = false;
        }
        //获取进度条
        this.progressBarNode = find("UICanvas/ProgressBar")
        this.progressBar = find("UICanvas/ProgressBar").getComponent(ProgressBar)
        //loading
        if (this.progressBarNode) {
            this.progressBarNode.active = false
        }

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
            //重置步数
            this.playerCtl.resetCurMoveIndex()
        }
    }

    /**
     * 进行中
     */
    playint() {
        //加载
        this.loading()        
    }

    /**
     * 结束
     */
    end() {
        //显示结束弹窗
        // let endCanvas = find('EndCanvas')
        // if (endCanvas) {
        //     endCanvas.active = true;
        // }

        //返回成绩
        // if (this.endLabel) {
        //     this.endLabel.string  = "结束了; 步数：" + this.playerCtl.getCurMoveIndex;
        // }
        // debugger
        //初始化
        this.init()
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
                this.end();
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
                //随机填充0和1，但是不能出现连续2个空路面
                if (this._road[i - 1] == BlockType.BT_NONE) {
                    //当前一个是空路面时下一个必须是路面
                    this._road.push(BlockType.BT_STONE)
                } else {
                    //随机填充
                    this._road.push(Math.floor(Math.random() * 2))
                }
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

    /**
     * 监听Player跳跃结束的事件方法
     */
    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepsLabel) {
            this.stepsLabel.string = '' + (moveIndex >= this.roadLenght ? this.roadLenght : moveIndex);
        }
        this.checkResult(moveIndex)
    }

    /**
     * 检查是否落到空路面
     */
    checkResult(moveIndex: number) {
        console.log(this._road[moveIndex], moveIndex, this.roadLenght, this._road)
        if (moveIndex < this.roadLenght) {
            if (this._road[moveIndex] == BlockType.BT_NONE) {
                //跳到了无路面的位置
                this.setCurState(GameState.GS_END)
            }
        } else {
            //超出最大长度
            this.setCurState(GameState.GS_END)
        }
    }

    /**
     * 加载进度
     */
    loading() {
        if (this.progressBar) {
            //显示进度条
            this.progressBarNode.active = true
            this.progressBarLabel= find("UICanvas/ProgressBar/Label").getComponent(Label)
            //初始化进度
            this.progressBar.progress = 0
            this.schedule(function () {
                //进度条速度控制
                let speed = 0.2;
                this.progressBar.progress = (this.progressBar.progress + speed >= 1) ? 1 : this.progressBar.progress + speed;
                this.progressBarLabel.string = '加载...' + Math.floor(this.progressBar.progress * 100)
                if (this.progressBar.progress >= 1) {
                    //加载完毕
                    this.progressBar.progress = 1
                    this.unschedule(this)
                    //隐藏进度条
                    this.progressBarNode.active = false
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
                
            }, 0.1, 5, 0);
        }
    }
}
