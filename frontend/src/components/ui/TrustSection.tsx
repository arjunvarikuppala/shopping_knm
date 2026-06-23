import { FiAward, FiShield, FiRefreshCcw, FiTruck, FiDollarSign } from 'react-icons/fi';

const trustItems = [
  {
    icon: FiAward,
    title: 'Premium Quality Sarees',
    description: 'Authentic weaves & pure heritage fabrics',
  },
  {
    icon: FiShield,
    title: 'Secure Payments',
    description: '100% encrypted checkout experience',
  },
  {
    icon: FiTruck,
    title: 'Fast Delivery',
    description: 'Quick shipping directly to your doorstep',
  },
  {
    icon: FiDollarSign,
    title: 'Cash on Delivery',
    description: 'Pay on delivery option available',
  },
  {
    icon: FiRefreshCcw,
    title: 'Easy Returns',
    description: '7-day hassle-free returns policy',
  },
];

export default function TrustSection() {
  return (
    <section className="bg-[#FFF8E7] py-16 border-t border-[#D4AF37]/20">
      <div className="container-app">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {trustItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-[#E5DCC5]/40 shadow-xs hover:shadow-md transition-shadow duration-300">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#800020]/5 text-[#800020] border border-[#D4AF37]/20">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-base font-bold text-[#800020]">
                {item.title}
              </h3>
              <p className="text-xs text-[#8C7B75]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
