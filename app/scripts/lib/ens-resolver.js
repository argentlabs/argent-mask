
const ensRegistries = {
    ropsten: '0x112234455c3a32fd11230c42e7bccd4a84e02010', // official ropsten ens registry
    rinkeby: '0x2e15B5F43561e13a344F392d062c178531D624d9', // our own ens registry
    mainnet: '0x314159265dd8dbb310642f98f50c066173c1259b',
}

const ensRegistryJson = require('./contracts/argent/ens/ensRegistry')
const ensResolverJson = require('./contracts/argent/ens/argentEnsResolver')

const Web3 = require('web3')
const web3 = new Web3()
const Promisifier = require('bluebird')

class EnsResolver {

    constructor(opts) {
        this.provider = opts.provider;
        web3.setProvider(this.provider);

        const ensRegistryAddress = ensRegistries[opts.getProviderConfig().type];
        const ensInstance = web3.eth.contract(ensRegistryJson).at(ensRegistryAddress);
        this.resolver = Promisifier.promisify(ensInstance.resolver);
    }

    async addressFromEns(ens) {
        console.log('1: ens:', ens)
        const ensResolverAddress = await this.resolver(this._namehash(ens)); // 0xc5463256e1c0c24e1eca9cc1072343f0e5617037
        const ensResolver = web3.eth.contract(ensResolverJson).at(ensResolverAddress);
        const addr = Promisifier.promisify(ensResolver.addr);
        console.log('2: addr:', await addr(this._namehash(ens)))
        return await addr(this._namehash(ens));
    }

    /* PRIVATE METHODS */

    _namehash(name) {
        var node = '0x0000000000000000000000000000000000000000000000000000000000000000';
        if (name !== '') {
            var labels = name.split(".");
            for (var i = labels.length - 1; i >= 0; i--) {
                node = web3.sha3(node + web3.sha3(labels[i]).slice(2), { encoding: 'hex' });
            }
        }
        return node.toString();
    }
}

module.exports = EnsResolver;