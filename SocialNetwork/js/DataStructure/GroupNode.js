/*群组节点*/
class GroupNode extends NodeBase {
    constructor(name, tag, coefficient = 1.0, id = -1) {
        super(name, tag, id);
        this.relationCoefficient = coefficient;
    }

    /*转换为便于序列化的对象*/
    toJsonableObject() {
        let res = super.toJsonableObject();
        res.coef = this.relationCoefficient;
        return res;
    }
}

