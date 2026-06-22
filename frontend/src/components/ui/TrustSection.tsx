import { FiAward, FiShield, FiRefreshCcw, FiTruck } from 'react-icons/fi';

const trustItems = [
  {
    icon: FiAward,
    title: 'Premium Quality',
    description: 'Authentic & Handcrafted Sarees',
  },
  {
    icon: FiShield,
    title: 'Secure Payments',
    description: '100% Protected Transactions',
  },
  {
    icon: FiRefreshCcw,
    title: 'Easy Returns',
    description: '7-Day Hassle-Free Returns',
  },
  {
    icon: FiTruck,
    title: 'Fast Shipping',
    description: 'Free Delivery Across India',
  },
];

export default function TrustSection() {
  return (
    <section className="bg-[#FFFFF0] py-16 border-t border-[#E5DCC5]/50">
      <div className="container-app">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#800000]/5 text-[#800000]">
                <item.icon className="h-8 w-8" />
              </div>
              <h3 className="mb-2 font-display text-lg font-bold text-[#800000]">
                {item.title}
              </h3>
              <p className="text-sm text-[#8C7B75]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
