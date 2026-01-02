'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Input } from '../ui/input'
import { QRCodeCanvas } from 'qrcode.react'
import { Loader2, CheckCircle, AlertCircle, Copy, ExternalLink, Shield, Clock, Info } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Card, CardContent } from '../ui/card'
import { Separator } from '../ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

interface PaymentMethodProps {
  paymentMethod: 'online' | 'cod'
  handleCheckout: (transactionId?: string) => void
  totalAmount: number
  isLoading: boolean
}

function Transaction({
  paymentMethod,
  handleCheckout,
  totalAmount,
  isLoading,
}: PaymentMethodProps) {
  const [transactionId, setTransactionId] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'instructions' | 'payment' | 'verification'>('instructions')
  const [isTransactionIdValid, setIsTransactionIdValid] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)

  const upiId = 'rashidabous123@oksbi'
  const upiLink = `upi://pay?pa=${upiId}&pn=Delta Garage&am=${totalAmount}&tn=OrderPayment&cu=INR`

  // Timer for payment verification
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 1800) { // 30 minutes
            setIsTimerActive(false)
            return 1800
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerActive])

  // Validate UPI transaction ID
  const validateTransactionId = (id: string) => {
    // Basic UPI transaction ID validation pattern
    const upiPattern = /^[A-Z0-9]{8,16}$/
    
    if (!upiPattern.test(id)) {
      return {
        isValid: false,
        message: 'Transaction ID should be 8-16 characters, uppercase letters and numbers only'
      }
    }

    // Check for common patterns
    if (/^[0-9]{12}$/.test(id)) {
      return {
        isValid: true,
        message: 'Valid bank transaction ID'
      }
    }

    if (/^UPI[A-Z0-9]{9}$/.test(id)) {
      return {
        isValid: true,
        message: 'Valid UPI transaction ID'
      }
    }

    return {
      isValid: true,
      message: 'Transaction ID looks valid'
    }
  }

  const handleTransactionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setTransactionId(value)
    
    if (value.length > 0) {
      const validation = validateTransactionId(value)
      setIsTransactionIdValid(validation.isValid)
    } else {
      setIsTransactionIdValid(false)
    }
  }

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const handleStartPayment = () => {
    setPaymentStep('payment')
    setIsTimerActive(true)
  }

  const handleCompletePayment = () => {
    const validation = validateTransactionId(transactionId)
    if (!validation.isValid) {
      alert(validation.message)
      return
    }
    
    // Confirm with user
    if (window.confirm('Please confirm that you have successfully completed the payment. The order will be processed after verification.')) {
      handleCheckout(transactionId)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const renderPaymentInstructions = () => (
    <Card>
      <CardContent className="pt-6">
        <Alert className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Secure Payment:</strong> Your payment is processed through secure UPI channels. Never share OTP or UPI PIN with anyone.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Payment Instructions
            </h3>
            <ol className="space-y-2 text-sm ml-6 list-decimal">
              <li>Complete the payment using any UPI app</li>
              <li>Save the transaction ID/reference number from payment receipt</li>
              <li>Return to this page and enter the transaction ID</li>
              <li>Click "Verify & Place Order" to complete your purchase</li>
            </ol>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Payment Amount</span>
              <span className="text-lg font-bold">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">UPI ID</span>
              <div className="flex items-center gap-2">
                <code className="px-2 py-1 bg-muted rounded text-sm">{upiId}</code>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={handleCopyUpiId}
                      >
                        {copySuccess ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {copySuccess ? 'Copied!' : 'Copy UPI ID'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <Button onClick={handleStartPayment} className="w-full">
            I Understand, Start Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderPaymentOptions = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Payment in progress</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Time: {formatTime(timer)}
          </Badge>
        </div>

        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Important:</strong> Please complete payment within 30 minutes. Keep this window open until payment is confirmed.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-medium">Choose Payment Method</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => window.open(upiLink)}
              >
                <ExternalLink className="h-5 w-5" />
                <span className="text-sm">Open UPI App</span>
                <span className="text-xs text-muted-foreground">Recommended</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => setShowQR(!showQR)}
              >
                <QRCodeCanvas value="test" size={20} style={{ display: 'none' }} />
                <span className="text-sm">Scan QR Code</span>
                <span className="text-xs text-muted-foreground">Mobile Camera</span>
              </Button>
            </div>

            {showQR && (
              <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed rounded-lg">
                <div className="p-2 bg-white rounded-lg">
                  <QRCodeCanvas
                    value={upiLink}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                  />
                </div>
                <div className="text-center space-y-1">
                  <Badge variant="secondary" className="mb-1">
                    Scan & Pay
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Amount: <span className="font-semibold">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </p>
                  <p className="text-xs">UPI ID: {upiId}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-medium">Verify Payment</h3>
            <p className="text-sm text-muted-foreground">
              After payment, enter the transaction ID from your payment receipt
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="transactionId" className="text-sm font-medium">
                  Transaction ID
                </label>
                {transactionId && (
                  <Badge variant={isTransactionIdValid ? "default" : "destructive"} className="text-xs">
                    {isTransactionIdValid ? 'Valid' : 'Invalid'}
                  </Badge>
                )}
              </div>
              
              <Input
                id="transactionId"
                placeholder="e.g., UPI123456789 or 123456789012"
                value={transactionId}
                onChange={handleTransactionIdChange}
                required
                disabled={isLoading}
                className={transactionId ? (isTransactionIdValid ? 'border-green-500' : 'border-red-500') : ''}
              />
              
              <div className="text-xs space-y-1">
                <p className="text-muted-foreground">
                  Transaction ID is usually 8-16 characters, uppercase letters & numbers
                </p>
                <p className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span>Find it in your payment app under "Transaction Details"</span>
                </p>
              </div>
            </div>

            {transactionId && !isTransactionIdValid && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please enter a valid UPI transaction ID (8-16 characters, uppercase letters and numbers only)
                </AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full"
              onClick={handleCompletePayment}
              disabled={!transactionId || !isTransactionIdValid || isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Payment...
                </>
              ) : (
                `Verify & Place Order (₹${totalAmount.toLocaleString('en-IN')})`
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setPaymentStep('instructions')}
              className="w-full"
              disabled={isLoading}
            >
              Back to Instructions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderCODPayment = () => (
    <Card>
      <CardContent className="pt-6">
        <Alert className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Cash on Delivery:</strong> Pay when your order is delivered. No advance payment required.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">COD Instructions</h3>
            <ul className="space-y-2 text-sm ml-6 list-disc">
              <li>Pay the exact amount to the delivery person</li>
              <li>Keep exact change ready for faster delivery</li>
              <li>You can verify the order before making payment</li>
              <li>Returns and refunds are subject to terms and conditions</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Amount to Pay</span>
              <span className="text-lg font-bold">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Payment Method</span>
              <Badge variant="secondary">Cash on Delivery</Badge>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => handleCheckout()}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Confirm COD Order (₹${totalAmount.toLocaleString('en-IN')})`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Terms and Conditions */}
      <div className="text-sm text-muted-foreground">
        <p>
          By placing order you agree to our{' '}
          <Link href="/T&C" className="underline text-primary font-medium">
            Terms & Conditions
          </Link>
          {' '}and{' '}
          <Link href="/privacy-policy" className="underline text-primary font-medium">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Payment Steps Indicator */}
      {paymentMethod === 'online' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${paymentStep === 'instructions' ? 'bg-primary text-primary-foreground' : 'bg-muted'}
            `}>
              1
            </div>
            <span className="text-sm">Instructions</span>
          </div>
          
          <div className="h-px flex-1 bg-border mx-2" />
          
          <div className="flex items-center gap-2">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${paymentStep === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}
            `}>
              2
            </div>
            <span className="text-sm">Payment</span>
          </div>
        </div>
      )}

      {/* Main Payment Content */}
      {paymentMethod === 'online' ? (
        paymentStep === 'instructions' ? renderPaymentInstructions() : renderPaymentOptions()
      ) : (
        renderCODPayment()
      )}

      {/* Security Note */}
      <div className="border-t pt-4">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <p>
            <strong>Security Note:</strong> We never ask for your UPI PIN, OTP, or password. 
            Payments are processed through secure UPI channels. For assistance, contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Transaction