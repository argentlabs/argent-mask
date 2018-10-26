const Component = require('react').Component
const h = require('react-hyperscript')
const inherits = require('util').inherits
const connect = require('react-redux').connect
const actions = require('../../../ui/app/actions')
const CoinbaseForm = require('./coinbase-form')
const ShapeshiftForm = require('./shapeshift-form')
const Loading = require('./loading')
const AccountPanel = require('./account-panel')
const RadioList = require('./custom-radio-list')
const {getNetworkDisplayName} = require('../../../app/scripts/controllers/network/util')

module.exports = connect(mapStateToProps)(BuyButtonSubview)

function mapStateToProps(state) {
  return {
    identity: state.appState.identity,
    account: state.metamask.accounts[state.appState.buyView.buyAddress],
    warning: state.appState.warning,
    buyView: state.appState.buyView,
    network: state.metamask.network,
    provider: state.metamask.provider,
    context: state.appState.currentView.context,
    isSubLoading: state.appState.isSubLoading,
  }
}

inherits(BuyButtonSubview, Component)

function BuyButtonSubview() {
  Component.call(this)
}

BuyButtonSubview.prototype.render = function () {
  return (
    h('div.get-eth', [
      this.headerSubview(),
      this.primarySubview(),
    ])
  )
}

BuyButtonSubview.prototype.headerSubview = function () {
  const props = this.props
  const isLoading = props.isSubLoading
  return (

    h('div.buy-eth', [

      // header bar (back button, label)
      h('header.panel.screen-header', [
        h('i.fa.fa-arrow-left.fa-lg.cursor-pointer.color-orange', {
          onClick: this.back.bind(this),
        }),
        h('h1', 'Buy ETH'),
      ]),

      // loading indication
      h('div.loading', {
        style: {
          position: 'absolute',
          top: '57vh',
          left: '49vw',
        },
      }, [
        h(Loading, {isLoading}),
      ]),

      // account panel
      h(AccountPanel, {
        showFullAddress: true,
        identity: props.identity,
        account: props.account,
      }),

      h('hr'),

    ])

  )
}


BuyButtonSubview.prototype.primarySubview = function () {
  const props = this.props
  const network = props.network

  switch (network) {
    case 'loading':
      return

    case '1':
      return this.mainnetSubview()

    // Ropsten, Rinkeby, Kovan
    case '3':
    case '4':
    case '42':
      const networkName = getNetworkDisplayName(network)
      const label = `${networkName} Test Faucet`
      return (
        h('div.panel.select-service-panel', [
          h('h3', 'Select service'),
          h('button', {
            onClick: () => this.props.dispatch(actions.buyEth({network})),
          }, label),
          // Kovan only: Dharma loans beta
          network === '42' ? (
            h('button', {
              onClick: () => this.navigateTo('https://borrow.dharma.io/'),
            }, 'Borrow With Dharma (Beta)')
          ) : null,
        ])
      )

    default:
      return (
        h('h2.error', 'Unknown network ID')
      )

  }
}

BuyButtonSubview.prototype.mainnetSubview = function () {
  const props = this.props

  return (

    h('.flex-column', {
      style: {
        alignItems: 'center',
      },
    }, [

      h('.flex-row.selected-exchange', {
        style: {
          position: 'relative',
          right: '35px',
          marginTop: '20px',
          marginBottom: '20px',
        },
      }, [
        h(RadioList, {
          defaultFocus: props.buyView.subview,
          labels: [
            'Coinbase',
            'ShapeShift',
          ],
          subtext: {
            'Coinbase': 'Crypto/FIAT (USA only)',
            'ShapeShift': 'Crypto',
          },
          onClick: this.radioHandler.bind(this),
        }),
      ]),

      h('h3.text-transform-uppercase', {
        style: {
          paddingLeft: '15px',
          fontFamily: 'Montserrat Light',
          width: '100vw',
          background: 'rgb(235, 235, 235)',
          color: 'rgb(174, 174, 174)',
          paddingTop: '4px',
          paddingBottom: '4px',
        },
      }, props.buyView.subview),

      this.formVersionSubview(),
    ])

  )
}

BuyButtonSubview.prototype.formVersionSubview = function () {
  const network = this.props.network
  if (network === '1') {
    if (this.props.buyView.formView.coinbase) {
      return h(CoinbaseForm, this.props)
    } else if (this.props.buyView.formView.shapeshift) {
      return h(ShapeshiftForm, this.props)
    }
  }
}

BuyButtonSubview.prototype.navigateTo = function (url) {
  global.platform.openWindow({url})
}

BuyButtonSubview.prototype.back = function () {
  if (this.props.context === 'confTx') {
    this.props.dispatch(actions.showConfTxPage(false))
  } else {
    this.props.dispatch(actions.goHome())
  }
}

BuyButtonSubview.prototype.radioHandler = function (event) {
  switch (event.target.title) {
    case 'Coinbase':
      return this.props.dispatch(actions.coinBaseSubview())
    case 'ShapeShift':
      return this.props.dispatch(actions.shapeShiftSubview(this.props.provider.type))
  }
}
