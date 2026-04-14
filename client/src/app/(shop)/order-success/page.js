'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import styles from './OrderSuccess.module.css';

export default function OrderSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get('id') || 'TB123456';
  const method = params.get('method') || 'razorpay';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Success animation */}
        <div className={styles.iconWrap}>
          <div className={styles.iconRing} />
          <CheckCircle size={60} className={styles.icon} />
        </div>

        <h1 className={styles.title}>Order Confirmed! 🎉</h1>
        <p className={styles.subtitle}>
          Thank you for shopping with TechBharat. Your order has been placed successfully.
        </p>

        <div className={styles.orderCard}>
          <div className={styles.orderRow}>
            <span>Order ID</span>
            <strong className={styles.orderId}>{orderId}</strong>
          </div>
          <div className={styles.orderRow}>
            <span>Payment</span>
            <span className={styles.payStatus}>
              {method === 'cod' ? '💵 Cash on Delivery' : '✅ Paid via Razorpay'}
            </span>
          </div>
          <div className={styles.orderRow}>
            <span>Estimated Delivery</span>
            <strong>
              {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </strong>
          </div>
        </div>

        <div className={styles.steps}>
          {['Order Placed', 'Processing', 'Shipped', 'Delivered'].map((s, i) => (
            <div key={s} className={`${styles.step} ${i === 0 ? styles.stepActive : ''}`}>
              <div className={styles.stepDot}>{i === 0 ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <p className={styles.emailNote}>
          📧 A confirmation email has been sent to your registered email address.
        </p>

        <div className={styles.actions}>
          <Link href="/account/orders" className="btn-primary">
            <Package size={16} /> Track Order
          </Link>
          <Link href="/" className="btn-outline">
            <Home size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
