'use client'

import React from 'react'
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'

function getSteps(): Step[] {
  return [
    {
      target: 'body',
      placement: 'center',
      title: 'Willkommen!',
      content:
        'Это короткий тур по платформе. За 5 шагов покажем ключевые элементы. Можно пропустить в любой момент.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="menu-button"]',
      title: 'Меню и навигация',
      content: 'Откройте боковое меню на мобильном. На десктопе оно слева постоянно.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="sidebar"]',
      title: 'Модули платформы',
      content: 'Здесь быстрый доступ к Dashboard, CRM, Активностям, Календарю и другим разделам.',
      placement: 'right',
    },
    {
      target: '#tour-kpis',
      title: 'KPI‑карточки',
      content: 'Ключевые показатели: компании, контакты, сделки, активности и события.',
      placement: 'top',
    },
    {
      target: '#tour-modules',
      title: 'Переход к разделам',
      content: 'Карты модулей ведут к основным разделам: CRM, Activities, Calendar и др.',
      placement: 'top',
    },
    {
      target: '[data-tour="theme-toggle"]',
      title: 'Тема',
      content: 'Переключайте Auto / Light / Dark. В Auto тема следует за системой.',
      placement: 'left',
    },
  ]
}

export default function OnboardingTour() {
  const [run, setRun] = React.useState(false)
  const [steps, setSteps] = React.useState<Step[]>([])

  React.useEffect(() => {
    // Показывать тур, если пользователь его ещё не прошёл
    try {
      const done = localStorage.getItem('mkOnboardingDone') === '1'
      const shouldStart = !done
      if (shouldStart) {
        setSteps(getSteps())
        // небольшая задержка, чтобы DOM успел смонтироваться
        setTimeout(() => setRun(true), 400)
      }
    } catch {}
  }, [])

  const handleJoyrideCallback = React.useCallback((data: CallBackProps) => {
    const { status } = data
    const finished = [STATUS.FINISHED, STATUS.SKIPPED].includes(status)
    if (finished) {
      try { localStorage.setItem('mkOnboardingDone', '1') } catch {}
      setRun(false)
    }
  }, [])

  if (!run) return null

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      disableScrolling
      scrollToFirstStep
      spotlightClicks={false}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#ef4444', // kaboom red
          textColor: 'var(--mk-joyride-text, #0f172a)',
          backgroundColor: 'var(--mk-joyride-bg, #fff)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
      }}
      locale={{
        back: 'Назад',
        close: 'Закрыть',
        last: 'Готово',
        next: 'Далее',
        skip: 'Пропустить',
      }}
      callback={handleJoyrideCallback}
    />
  )
}


