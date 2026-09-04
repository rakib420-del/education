import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CourseDetailPage, { generateMetadata as generateCourseMetadata } from '@/app/courses/[slug]/page';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return generateCourseMetadata({ params });
}

export default async function BookDetailPage({ params }: { params: { slug: string } }) {
  return <CourseDetailPage params={params} />;
}
