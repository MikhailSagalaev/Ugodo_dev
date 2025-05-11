import { useState } from 'react'
import axios from 'axios'
// import { IMaskInput } from 'react-imask' // Закомментировано для теста
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { MEDUSA_BACKEND_URL } from "@lib/config"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const LoginSMS = ({ setCurrentView }: Props) => {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [customer, setCustomer] = useState<any>(null)

  const requestCode = async () => {
    setError('')
    if (!phone || !phone.startsWith('7') || phone.length !== 11) {
      setError('Введите корректный номер телефона')
      return
    }
    try {
      await axios.post(`${MEDUSA_BACKEND_URL}/store/auth/sms/request`, { phone: `+${phone}` })
      setStep(2)
    } catch (e: any) {
      setError(e.response?.data?.error || 'Ошибка отправки SMS')
    }
  }

  const verifyCode = async () => {
    setError('')
    if (!phone || !phone.startsWith('7') || phone.length !== 11) {
      setError('Ошибка: номер телефона недействителен.')
      return
    }
    try {
      const res = await axios.post(`${MEDUSA_BACKEND_URL}/store/auth/sms/verify`, { phone: `+${phone}`, code })
      setCustomer(res.data.customer)
      setStep(3)
    } catch (e: any) {
      setError(e.response?.data?.error || 'Ошибка проверки кода')
    }
  }

  return (
    <div className="max-w-sm w-full flex flex-col items-center" data-testid="login-sms-page">
      <h1 className="text-large-semi uppercase mb-6">Вход по SMS</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Введите номер телефона для входа или регистрации.
      </p>
      {step === 1 && (
        <form className="w-full" onSubmit={e => { e.preventDefault(); requestCode() }}>
          {/* <IMaskInput
            mask="+{7} (000) 000-00-00"
            value={phone}
            unmask={true}
            onAccept={(value: string, maskRef: any) => setPhone(value)}
            placeholder="+7 (___) ___-__-__"
            type="tel"
            required
            className="w-full border rounded px-3 py-2 mb-2"
          /> */}
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+7 (___) ___-__-__"
            required
            className="w-full border rounded px-3 py-2 mb-2"
            // Простая валидация для примера, можно усложнить или убрать
            pattern="^7[0-9]{10}$" 
            title="Введите номер в формате 7XXXXXXXXXX"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-2">Получить код</button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}
      {step === 2 && (
        <form className="w-full" onSubmit={e => { e.preventDefault(); verifyCode() }}>
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Код из SMS"
            type="text"
            required
            className="w-full border rounded px-3 py-2 mb-2"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-2">Войти</button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}
      {step === 3 && customer && (
        <div className="text-green-700 font-semibold mt-4">Добро пожаловать, {customer.phone || ''}!</div>
      )}
      <button
        onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
        className="underline text-blue-600 mt-6"
        data-testid="back-to-login"
      >
        Войти по email/паролю
      </button>
    </div>
  )
}

export default LoginSMS 