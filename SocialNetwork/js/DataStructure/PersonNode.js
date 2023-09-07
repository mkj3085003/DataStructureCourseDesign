/* 个人节点*/
// PersonNode.js
// 性别枚举
const PersonGender = {
    MALE: 1,
    FEMALE: 2,
    OTHER: 3
};

/**
 * 个人节点。
 */
class PersonNode extends NodeBase {
    constructor(name, gender, id = -1) {
        super(name, NodeTag.PERSON, id);
        this.gender = gender;
    }

    /**
     * 转换为便于序列化的对象。
     */
    toJsonableObject() {
        let res = super.toJsonableObject();
        res.gender = this.gender;
        return res;
    }
}