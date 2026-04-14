'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, MapPin, CreditCard, Truck, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { loadRazorpay } from '@/lib/api';
import styles from './Checkout.module.css';

const STEPS = ['Address', 'Review Order', 'Payment'];
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Chandigarh','Puducherry'];

const SHIPPING_THRESHOLD = 999;
const GST_RATE = 0.18;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { isAuthenticated, user, token } = useAuthStore();

  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    country: 'India',
  });
  const [addrErrors, setAddrErrors] = useState({});

  // Price calculations
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : 99;
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + shipping + gst;

  useEffect(() => {
    if (items.length === 0) router.replace('/cart');
  }, [items.length, router]);

  const validateAddress = () => {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = 'Required';
    if (!/^[6-9]\d{9}$/.test(address.phone)) errs.phone = 'Enter valid 10-digit mobile number';
    if (!address.addressLine1.trim()) errs.addressLine1 = 'Required';
    if (!address.city.trim()) errs.city = 'Required';
    if (!address.state) errs.state = 'Required';
    if (!/^\d{6}$/.test(address.pincode)) errs.pincode = 'Enter valid 6-digit pincode';
    setAddrErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddressNext = () => {
    if (validateAddress()) setStep(1);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setError('');

    if (paymentMethod === 'razorpay') {
      await handleRazorpay();
    } else {
      await handleCOD();
    }
    setIsProcessing(false);
  };

  const handleRazorpay = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      setError('Razorpay SDK failed to load. Please check your connection.');
      return;
    }

    try {
      // Step 1: Create order on backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const orderRes = await fetch(`${API_URL}/payments/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: total, currency: 'INR' }),
      });

      if (!orderRes.ok) throw new Error('Failed to create payment order');
      const orderData = await orderRes.json();

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: 'INR',
        name: 'TechBharat Store',
        description: `Order for ${items.length} item(s)`,
        image: '/logo.png',
        order_id: orderData.data.id,
        prefill: {
          name: address.fullName,
          email: user?.email || '',
          contact: address.phone,
        },
        notes: {
          address: `${address.addressLine1}, ${address.city}, ${address.state} - ${address.pincode}`,
        },
        theme: { color: '#C9A84C' },
        handler: async (response) => {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await fetch(`${API_URL}/payments/razorpay/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                shippingAddress: address,
                items: items.map(i => ({ product: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
                itemsPrice: subtotal,
                taxPrice: gst,
                shippingPrice: shipping,
                totalPrice: total,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              router.push(`/order-success?id=${verifyData.data.orderNumber}&method=razorpay`);
            } else {
              setError('Payment verification failed. Contact support with your payment ID: ' + response.razorpay_payment_id);
            }
          } catch {
            setError('Error verifying payment. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setError('Payment was cancelled.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleCOD = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          shippingAddress: address,
          paymentMethod: 'cod',
          items: items.map(i => ({ product: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
          itemsPrice: subtotal,
          taxPrice: gst,
          shippingPrice: shipping,
          totalPrice: total,
        }),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        router.push(`/order-success?id=${data.data.orderNumber}&method=cod`);
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="container">
      <nav className={styles.breadcrumb}>
        <Link href="/">Home</Link><ChevronRight size={13} />
        <Link href="/cart">Cart</Link><ChevronRight size={13} />
        <span>Checkout</span>
      </nav>

      <h1 className={styles.pageTitle}>Checkout</h1>

      {/* Step indicator */}
      <div className={styles.stepper}>
        {STEPS.map((s, i) => (
          <div key={s} className={`${styles.step} ${i <= step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
            <div className={styles.stepCircle}>
              {i < step ? <CheckCircle size={16} /> : <span>{i + 1}</span>}
            </div>
            <span className={styles.stepLabel}>{s}</span>
            {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
          </div>
        ))}
      </div>

      <div className={styles.layout}>
        {/* Left panel */}
        <div className={styles.mainPanel}>

          {/* STEP 0: Address */}
          {step === 0 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><MapPin size={20} /> Delivery Address</h2>

              {!isAuthenticated && (
                <div className={styles.loginPrompt}>
                  <AlertCircle size={16} />
                  <span>
                    <Link href="/login?redirect=checkout">Sign in</Link> to use saved addresses & track orders.
                  </span>
                </div>
              )}

              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Full Name *</label>
                  <input className="input" value={address.fullName} onChange={e => setAddress(p => ({ ...p, fullName: e.target.value }))} placeholder="As on delivery" />
                  {addrErrors.fullName && <span className={styles.fieldError}>{addrErrors.fullName}</span>}
                </div>
                <div className={styles.field}>
                  <label>Mobile Number *</label>
                  <input className="input" value={address.phone} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" maxLength={10} />
                  {addrErrors.phone && <span className={styles.fieldError}>{addrErrors.phone}</span>}
                </div>
                <div className={styles.field}>
                  <label>Pincode *</label>
                  <input className="input" value={address.pincode} onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))} placeholder="6-digit pincode" maxLength={6} />
                  {addrErrors.pincode && <span className={styles.fieldError}>{addrErrors.pincode}</span>}
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Address Line 1 *</label>
                  <input className="input" value={address.addressLine1} onChange={e => setAddress(p => ({ ...p, addressLine1: e.target.value }))} placeholder="House / Flat no., Building, Street" />
                  {addrErrors.addressLine1 && <span className={styles.fieldError}>{addrErrors.addressLine1}</span>}
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Address Line 2</label>
                  <input className="input" value={address.addressLine2} onChange={e => setAddress(p => ({ ...p, addressLine2: e.target.value }))} placeholder="Area, Landmark (optional)" />
                </div>
                <div className={styles.field}>
                  <label>City *</label>
                  <input className="input" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} placeholder="City" />
                  {addrErrors.city && <span className={styles.fieldError}>{addrErrors.city}</span>}
                </div>
                <div className={styles.field}>
                  <label>State *</label>
                  <select className="input" value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))}>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button className="btn-primary" onClick={handleAddressNext}>
                  Continue to Review <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Review */}
          {step === 1 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><Truck size={20} /> Review Your Order</h2>

              <div className={styles.addressSummary}>
                <div className={styles.addressSummaryRow}>
                  <MapPin size={15} className={styles.addrIcon} />
                  <div>
                    <strong>{address.fullName}</strong> · {address.phone}
                    <br />
                    {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.state} — {address.pincode}
                  </div>
                  <button className={styles.changeBtn} onClick={() => setStep(0)}>Change</button>
                </div>
              </div>

              <div className={styles.reviewItems}>
                {items.map(item => (
                  <div key={item.id} className={styles.reviewItem}>
                    <div className={styles.reviewItemLeft}>
                      <span className={styles.reviewItemQty}>×{item.quantity}</span>
                      <span className={styles.reviewItemName}>{item.name}</span>
                    </div>
                    <span className={styles.reviewItemPrice}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className={styles.cardFooter}>
                <button className="btn-ghost" onClick={() => setStep(0)}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(2)}>
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><CreditCard size={20} /> Payment Method</h2>

              <div className={styles.paymentMethods}>
                <label className={`${styles.payMethod} ${paymentMethod === 'razorpay' ? styles.payMethodActive : ''}`}>
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                  <div className={styles.payMethodInfo}>
                    <strong>Razorpay — UPI / Cards / Net Banking / Wallets</strong>
                    <p>Pay securely with UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, or Net Banking</p>
                  </div>
                  <span className={styles.payBadge}>Recommended</span>
                </label>

                <label className={`${styles.payMethod} ${paymentMethod === 'cod' ? styles.payMethodActive : ''}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <div className={styles.payMethodInfo}>
                    <strong>Cash on Delivery</strong>
                    <p>Pay in cash when your order arrives. Additional ₹50 COD fee applies.</p>
                  </div>
                </label>
              </div>

              {paymentMethod === 'razorpay' && (
                <div className={styles.razorpayInfo}>
                  <div className={styles.rzpRow}><span>💳</span> Credit / Debit Cards (Visa, Mastercard, Rupay)</div>
                  <div className={styles.rzpRow}><span>📱</span> UPI (GPay, PhonePe, Paytm, BHIM)</div>
                  <div className={styles.rzpRow}><span>🏦</span> Net Banking (50+ banks)</div>
                  <div className={styles.rzpRow}><span>👛</span> Wallets (Mobikwik, Freecharge, etc.)</div>
                </div>
              )}

              {error && (
                <div className={styles.errorBox}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.cardFooter}>
                <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button
                  className="btn-primary"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  style={{ minWidth: 200, justifyContent: 'center' }}
                >
                  {isProcessing ? (
                    <><div className="spinner" style={{ width: 16, height: 16 }} /> Processing…</>
                  ) : paymentMethod === 'razorpay' ? (
                    `Pay ₹${total.toLocaleString('en-IN')} via Razorpay`
                  ) : (
                    `Place Order — ₹${total.toLocaleString('en-IN')}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <div className={styles.summaryItems}>
              {items.map(i => (
                <div key={i.id} className={styles.summaryItem}>
                  <span className={styles.summaryItemName}>{i.name} ×{i.quantity}</span>
                  <span>₹{(i.price * i.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className={styles.summaryRow}><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className={styles.summaryRow}><span>GST (18%)</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
            <div className={styles.summaryRow}><span>Shipping</span><span className={shipping === 0 ? styles.free : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            {paymentMethod === 'cod' && <div className={styles.summaryRow}><span>COD Fee</span><span>₹50</span></div>}
            <div className="divider" />
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>₹{(total + (paymentMethod === 'cod' ? 50 : 0)).toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.secureNote}>🔒 Secured by Razorpay · 256-bit SSL</div>
          </div>
        </div>
      </div>
    </div>
  );
}
