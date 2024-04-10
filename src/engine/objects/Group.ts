import { Object3D } from '../Object';

export class Group extends Object3D {
    constructor(name?: string) {
        super();
        this.name = name;
    }
}
