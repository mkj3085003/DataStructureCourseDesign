// 节点标签枚举
const NodeTag = {
    NUL: 'nul', // 未设置
    PERSON: 'person', // 个人
    PRIMARY_SCHOOL: 'primary school', // 小学
    JUNIOR_HIGH: 'junior high', // 初中
    SENIOR_HIGH: 'senior high', // 高中
    UNIVERSITY: 'university', // 大学
    GROUP: 'group' // 普通群组
};

// 节点基类
class NodeBase {
    constructor(name, tag = NodeTag.NUL, id = -1) {
        this.name = name;
        this.tag = tag;
        this.id = id;
        this.relations = [];
    }

    /*
     * 序列化格式：JSON 字符串
     *
     * {
     *     "id": int,
     *     "tag": string,
     *     "name": string,
     *     "relations": [ id: int ]
     *     "gender": int, // optional
     *     "coef": int // optional
     * }
     */

    /**
     * 转为可序列化对象。
     */
    toJsonableObject() {
        let res = {
            name: this.name,
            tag: this.tag,
            id: this.id,
            relations: this.relations.map(it => it.id)
        };
        return res;
    }

    /**
     * 添加关系。
     * @param node 对方节点。
     * @param bothSide 是否双向添加。
     */
    addRelation(node, bothSide = true) {
        // 检查当前节点是否已经和要添加的节点建立了关系
        if (
            this.relations.map(it => it === node ? 1 : 0)
                .reduce((a, b) => a + b, 0) === 0
        ) {
            // 如果没有建立关系，将要添加的节点添加到当前节点的关系列表中
            this.relations.push(node);

            // 如果 bothSide 参数为 true，则在要添加的节点的关系列表中也添加当前节点
            if (bothSide) {
                node.relations.push(this);
            }
        }
    }

    /**
     * 解除关系。
     * @param node 对方节点。
     * @param bothSide 是否双向解除。
     */
    removeRelation(node, bothSide = true) {
        for (let idx = 0; idx < this.relations.length; idx++) {
            if (this.relations[idx] === node) {
                this.relations.splice(idx, 1);
                if (bothSide) {
                    node.removeRelation(this, false);
                }
                break;
            }
        }
    }
}
