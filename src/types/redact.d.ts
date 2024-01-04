type Composition = {
    options: {
        ticks_per_beat: number;
    };
    tree: CompositionNode;
}

type CompositionNode = {
    element: object;
    start: number;
    end: number;
    name?: string;
    seed: number;
    rendered: boolean;
    children?: CompositionNode[];
    error?: object;
};

export { Composition, CompositionNode };
