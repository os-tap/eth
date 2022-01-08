import React from "react";
import "./App.css";
import { Button, ButtonGroup, Card, Form, Tooltip, OverlayTrigger } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Keygen } from './helpers/keygen'
import { Contract } from "./helpers/contract"
import * as utils from './helpers/utils'


function Pass({ pass, index, removePass, makeVisible, makeEditable }) {
  const [copyTooltip, setCopyTooltip] = React.useState('copy')
  async function copyPass(e) {
    await navigator.clipboard.writeText(pass.pass)
    setCopyTooltip('copied!')
  }
  return (
    <Form>
      <Form.Group>
        <div className="row align-items-end">
          <div className="col">
            {index == 0 && <Form.Label>Site</Form.Label>}
            <Form.Control disabled={pass.edit} readOnly={pass.edit} defaultValue={pass.site} type="text" className="input form-control-plaintext" onChange={e => pass.site = e.target.value} />
          </div>
          <div className="col">
            {index == 0 && <Form.Label>Login</Form.Label>}
            <Form.Control disabled={pass.edit} readOnly={pass.edit} defaultValue={pass.login} type="text" className="input form-control-plaintext" onChange={e => pass.login = e.target.value} />
          </div>
          <div className="col">
            {index == 0 && <Form.Label>Pass</Form.Label>}
            <Form.Control disabled={pass.edit} readOnly={pass.edit} defaultValue={pass.pass} type={pass.visible ? "text" : "password"} className="input form-control-plaintext" onChange={e => pass.pass = e.target.value} />
          </div>
          <div className="col removeBtn-col">
            <ButtonGroup>
              <OverlayTrigger
                placement='bottom'
                onExited={() => setCopyTooltip('copy')}
                overlay={
                  <Tooltip>
                    {copyTooltip}
                  </Tooltip>
                }>
                <Button onClick={copyPass}>&#128203;</Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement='bottom'
                overlay={
                  <Tooltip>
                    show
                  </Tooltip>
                }>
                <Button onClick={() => makeVisible(index)}>&#128065;</Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement='bottom'
                overlay={
                  <Tooltip>
                    edit
                  </Tooltip>
                }>
                <Button onClick={() => makeEditable(index)}>&#9997;</Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement='bottom'
                overlay={
                  <Tooltip>
                    delete
                  </Tooltip>
                }>
                <Button onClick={() => removePass(index)}>&#10060;</Button>
              </OverlayTrigger>
            </ButtonGroup>
          </div>
        </div>
      </Form.Group>
    </Form>
  );

}

function FormKey({ keygen, fetch_blockckain }) {
  const [value, setValue] = React.useState("")
  const [changed, setCHange] = React.useState(false)

  async function import_key_from_storage() {
    const v = window.localStorage.getItem('ak')
    if (!v) return
    let res = await keygen.import(utils.hex2buf(v))
    if (res) {
      setValue(v)
      console.log('key_fetch')
      await fetch_blockckain()
    }
    return res
  }

  React.useEffect(() => {
    console.log('key_use_effect')
    import_key_from_storage()
  }, [] /* [keygen, fetch_blockckain] */)
  


  const onChange = e => {
    setValue(e.target.value)
    setCHange(true)
  }

  const onSubmit = async e => {
    e.preventDefault()
    const name = e.nativeEvent.submitter.name

    if (name == 'generate-key') {
      if (!value || window.confirm('Existing data will be lost! If you dont know key, you will not be able to restore data from blockchain')) {
        await keygen.generate()
        let hex_key = utils.buf2hex(await keygen.export())
        setValue(hex_key)
        setCHange(false)
        window.localStorage.setItem('ak', hex_key)
      }
    }
    else if (name == 'import-key') {
      if (!value) {
        window.alert('Type aes 256 bit key in hex!')
      }
      else {
        let res = await keygen.import(utils.hex2buf(value))
        if (!res) window.alert('Input is invalid!')
        else window.localStorage.setItem('ak', value)
        setCHange(false)
      }
    }
  }

  return (
    <Form onSubmit={onSubmit}>
      <Form.Group>
        <Form.Label><b>AES KEY</b></Form.Label>
        <Form.Control name='aes' type="text" className="input" value={value} onChange={onChange} placeholder="type hex key or press generate" />
      </Form.Group>
      <br />
      <div className="d-flex justify-content-center">
        <Button name='generate-key' variant="primary mb-3" type="submit">
          Generate Key
        </Button>&nbsp;
        <Button disabled={!(!!value * changed)} name='import-key' variant="primary mb-3" type="submit">
          Import Key
        </Button>
      </div>
    </Form>
  )
}

function LoadingButton(props) {
  const [isLoading, setLoading] = React.useState(false);

  const handleClick = async e => {
    setLoading(true)
    await props.onClick()
    setLoading(false)
  }

  return (
    <Button
      variant="primary mb-3"
      disabled={isLoading}
      onClick={!isLoading ? handleClick : null}
    >
      {isLoading ? 'Loading…' : props.title}
    </Button>
  );
}

function FormAction({ addPass, fetch_blockckain, save_blockckain }) {
  return (
    <Form>
      <Button name='add' variant="primary mb-3" onClick={addPass}>
        Add Pass
      </Button>&nbsp;
      <LoadingButton name='save' variant="primary mb-3" onClick={save_blockckain} title="Save to Blockchain" />
      &nbsp;
      <LoadingButton title='Fetch Blockchain' name='fetch' variant="primary mb-3" onClick={fetch_blockckain} />
    </Form>
  )
}

const keygen = new Keygen
const contract = new Contract(window.ethereum)

function App() {
  const [passes, setPasses] = React.useState([]);
  const [view, setView] = React.useState('loader')

  async function init() {
    const ok = await contract.init_metamask()
    if (!ok) setView('metamask')
    else if (window.ethereum.chainId != 4) setView('testnet')
    else setView('ok')
  }

  React.useEffect(() => {  
    //Данные действия исполняются только один раз
    if (window.ethereum === undefined) {
      // Проверяем, установлен ли у пользователя метамаск
      setView('no_metamask')
    } else {
      // Подключаем метамаск на сайт, запрашивая аккаунты
      init()

     /* window.ethereum.on('connect', data => {
        init()
      }) */

      // Если метамаск установлен, то расставляем на него коллбеки
      window.ethereum.on('accountsChanged', accounts => {
        // Коллбек на смену аккаунтов. Если доступных аккаунтов нет, 
        // значит метамаск был деактивирован
        if (accounts.length > 0) {
          setView('ok')
          contract.set_account(accounts[0])
          fetch_blockckain()
        }
        else setView('metamask')
      })
      window.ethereum.on('chainChanged', chainId => {
        // Коллбек на смену сети. Работаем только в Rinkeby (номер 4)
        if (chainId == 4) setView('ok')
        else setView('testnet')
      })
    }
  }, [contract])



  const sep1 = ';;;'
  const sep2 = '|||'
  const serialize = p => p.site + sep1 + p.login + sep1 + p.pass

  async function save_blockckain() {
    if (!keygen.is_valid()) return
    
    const newPasses = [...passes]
    newPasses.map(p => p.edit = true)
    setPasses(newPasses);

    let s = passes.map(serialize).join(sep2)
    let crypted = await keygen.encryptMessage(s)
    let res = await contract.save(utils.buf2hex(crypted))
  }

  async function fetch_blockckain() {
    if (!keygen.is_valid()) return
    setPasses([])
    let data = await contract.fetch()
    if (!data) return alert('blockchain data is empty!')

    let open = await keygen.decryptMessage(utils.hex2buf(data))

    const fields = ['site', 'login', 'pass']
    const newPasses = open.split(sep2).map(ps => {
      let ob = { edit: true, visible: false }
      ps.split(sep1).forEach((f, i) => ob[fields[i]] = f)
      return ob
    })

    setPasses(newPasses)
  }

  async function fetch_blockckain_btn() {
    if (!keygen.is_valid()) alert('Key is invalid! Please, paste correct 256 bit key in hex, or press btn to Generate the new one')
    else await fetch_blockckain()
  }

  async function save_blockckain_btn() {
    if (!keygen.is_valid()) alert('Key is invalid! Please, paste correct 256 bit key in hex, or press btn to Generate the new one')
    else await save_blockckain()
  }

  const addPass = _ => {
    const newPasses = [...passes, {}];
    setPasses(newPasses);
  };

  const removePass = index => {
    const newPasses = [...passes];
    newPasses.splice(index, 1);
    setPasses(newPasses);
  }

  const makeVisible = index => {
    const newPasses = [...passes];
    newPasses[index].visible = !newPasses[index].visible
    setPasses(newPasses);
  }

  const makeEditable = index => {
    const newPasses = [...passes];
    newPasses[index].edit = !newPasses[index].edit
    setPasses(newPasses);
  }

  const no_metamask = (
    <h1 className="text-center mb-4">Please, install metamask plugin</h1>
  );

  const activate_metamask = (
    <Form>
      <h1 className="text-center mb-4">Please, activate metamask plugin</h1>
      {/* <Button name='meta' variant="primary mb-3" onClick={contract.init_metamask}>
      Activate Metamask
    </Button>&nbsp; */}
    </Form>
  );

  const testnet = (
    <h1 className="text-center mb-4">Please, use Rinkeby testnet</h1>
  );

  const bigSpinnerStyle = {
    width: 5 + 'rem',
    height: 5 + 'rem'
  }
  const coverStyle = {
    minHeight: 80 + 'vh'
  }
  const loader = (
    <div className="d-flex justify-content-center align-items-center" style={coverStyle}>
      <div className="spinner-grow text-primary" role="status" style={bigSpinnerStyle}>
      </div>
    </div>
  );

  const main_form = (
    <div>
      <h1 className="text-center mb-4">Password manager</h1>
      <FormKey addPass={addPass} keygen={keygen} fetch_blockckain={fetch_blockckain} />
      <div className="pass-list">


        {passes.map((pass, index) => (
          <Card className="pass">
            <Card.Body>
              <Pass
                key={index}
                index={index}
                pass={pass}
                removePass={removePass}
                makeVisible={makeVisible}
                makeEditable={makeEditable}
              />
            </Card.Body>
          </Card>
        ))}
      </div>
      <br />
      <FormAction addPass={addPass} keygen={keygen} fetch_blockckain={fetch_blockckain_btn} save_blockckain={save_blockckain_btn} />
    </div>
  );

  let rdr = main_form
  switch (view) {
    case 'no_metamask': rdr = no_metamask; break
    case 'metamask': rdr = activate_metamask; break
    case 'testnet': rdr = testnet; break
    case 'ok': rdr = main_form; break
    case 'loader': rdr = loader; break
  }


  return (
    <div className="app">
      <div className="container">
        <br />
        {rdr}
      </div>
    </div>
  );
}

export default App;