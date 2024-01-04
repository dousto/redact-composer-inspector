export default {
    get: (name: string) => {
        switch (name) {
            case 'examples/simple': {
                return require('../../assets/examples/simple.json');
            }
        }
    },
};
