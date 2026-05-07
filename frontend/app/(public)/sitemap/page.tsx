'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { FiArrowRight, FiFileText, FiLink, FiMap, FiTarget } from 'react-icons/fi';

const SitemapHtmlPage = () => {
  const sections = [
    {
      title: 'Halaman Utama',
      icon: <FiLink className="text-blue-500" />,
      links: [
        { label: 'Beranda', href: '/' },
        { label: 'Tentang Kami', href: '/tentang-kami' },
        { label: 'Tim Ahli Gizi', href: '/ahli-gizi' },
        { label: 'Kalkulator Gizi Gratis', href: '/cek-kondisi' },
        { label: 'Harga & Program', href: '/harga' },
        { label: 'Blog & Artikel', href: '/blog' },
      ]
    },
    {
      title: 'Program Konsultasi',
      icon: <FiTarget className="text-green-500" />,
      links: [
        { label: 'Body Goals (Berat Badan Ideal)', href: '/program/body-goals' },
        { label: 'Body for Baby (Ibu & Anak)', href: '/program/body-for-baby' },
        { label: 'Clinicare (Kondisi Medis)', href: '/program/clinicare' },
      ]
    },
    {
      title: 'Hukum & Legalitas',
      icon: <FiFileText className="text-purple-500" />,
      links: [
        { label: 'Syarat & Ketentuan', href: '/syarat-ketentuan' },
        { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12 text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-green-600 text-2xl">
            <FiMap />
          </div>
          <h1 className="text-4xl font-black text-gray-900">Sitemap</h1>
          <p className="text-gray-500">Daftar seluruh halaman yang tersedia di website NutriPro</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, i) => (
            <Card key={i} className="p-8 space-y-6 shadow-md border-none">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
              </div>
              <ul className="space-y-4">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="group flex items-center justify-between text-gray-600 hover:text-green-600 transition-colors">
                      <span className="font-medium">{link.label}</span>
                      <FiArrowRight className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Mencari file XML untuk mesin pencari? <Link href="/sitemap.xml" className="text-green-600 font-bold hover:underline">Liat di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SitemapHtmlPage;
