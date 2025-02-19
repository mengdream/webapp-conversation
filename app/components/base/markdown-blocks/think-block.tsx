import React from 'react'
import { useTranslation } from 'react-i18next'

const hasEndThink = (children: any): boolean => {
    if (typeof children === 'string')
        return children.includes('[ENDTHINKFLAG]')

    if (Array.isArray(children))
        return children.some(child => hasEndThink(child))

    if (children?.props?.children)
        return hasEndThink(children.props.children)

    return false
}

const removeEndThink = (children: any): any => {
    if (typeof children === 'string')
        return children.replace('[ENDTHINKFLAG]', '')

    if (Array.isArray(children))
        return children.map(child => removeEndThink(child))

    if (children?.props?.children) {
        return React.cloneElement(
            children,
            {
                ...children.props,
                children: removeEndThink(children.props.children),
            },
        )
    }

    return children
}

const ThinkBlock = ({ children, ...props }: any) => {
    const isComplete = hasEndThink(children)
    const displayContent = removeEndThink(children)
    const { t } = useTranslation()

    return (
        <details
            {...(!isComplete && { open: true })}
            className="group"
            style={{
                color: 'gray',
                backgroundColor: '#f8f8f8',
                padding: '8px',
                borderRadius: '4px',
            }}
        >
            <summary className="text-gray-500 font-bold list-none pl-2 flex items-center cursor-pointer select-none whitespace-nowrap">
                <div className="flex-shrink-0 flex items-center">
                    <svg
                        className="w-3 h-3 mr-2 transform transition-transform duration-500 group-open:rotate-90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                    {isComplete ? t('common.chat.thought') : t('common.chat.thinking')}
                </div>
            </summary>
            <div className="text-gray-500 p-3 ml-2 bg-gray-50 border-l border-gray-300">
                {displayContent}
            </div>
        </details>
    )
}

export default ThinkBlock