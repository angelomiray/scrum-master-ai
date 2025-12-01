import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8000'

export default function Modal({ isOpen, onClose, title, children, onConfirm, confirmText = 'Confirmar', confirmColor = 'blue' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>
        
        {/* Footer */}
        {onConfirm && (
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white bg-${confirmColor}-600 hover:bg-${confirmColor}-700 rounded-lg transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Modal de confirmação especializado
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onConfirm={onConfirm}
      confirmText={confirmText}
      confirmColor={confirmColor}
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  )
}
