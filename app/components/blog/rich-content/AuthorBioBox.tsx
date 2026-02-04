import React from 'react';
import { OptimizedImage } from '@/app/components/OptimizedImage';
import { Author } from '@/lib/authors';
import { Twitter, Linkedin, Globe, Instagram } from 'lucide-react';

interface AuthorBioBoxProps {
    author: Author;
}

export function AuthorBioBox({ author }: AuthorBioBoxProps) {
    return (
        <div className="mt-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Column */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md">
                        <OptimizedImage
                            src={author.avatar}
                            alt={author.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                            {author.name}
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
                                {author.role}
                            </span>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                            {author.bio}
                        </p>
                    </div>

                    {/* Credentials */}
                    {author.credentials && (
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {author.credentials.map((cred, i) => (
                                <span key={i} className="text-xs font-semibold text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded">
                                    {cred}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Social Links */}
                    <div className="flex justify-center md:justify-start gap-4 pt-2">
                        {author.social.twitter && (
                            <a href={`https://twitter.com/${author.social.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        )}
                        {author.social.linkedin && (
                            <a href={`https://linkedin.com/${author.social.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        )}
                        {author.social.website && (
                            <a href={author.social.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <Globe className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
