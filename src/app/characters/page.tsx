// src/app/characters/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCharactersStore } from '@/lib/stores/characters'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { IconPlus } from '@/components/icons'

export default function CharactersPage() {
  const { characters, isLoaded, loadCharacters } = useCharactersStore()

  useEffect(() => {
    if (!isLoaded) {
      loadCharacters()
    }
  }, [isLoaded, loadCharacters])

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader
        title="角色管理"
        backHref="/"
        actions={
          <Link href="/characters/new">
            <Button size="sm">
              <IconPlus className="w-4 h-4 mr-2" />
              新建角色
            </Button>
          </Link>
        }
      />

      <main className="flex-1 p-4">
        {characters.length === 0 ? (
          <Card>
            <p className="text-center text-mist-text-secondary py-8">
              暂无角色，点击右上角创建
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <Link key={character.id} href={`/characters/${character.id}`}>
                <Card className="h-full hover:bg-white/5">
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={character.avatar}
                      name={character.name}
                      size="xl"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-mist-text truncate">
                        {character.name}
                      </h3>
                      {character.description && (
                        <p className="text-sm text-mist-text-secondary mt-1 line-clamp-3">
                          {character.description}
                        </p>
                      )}
                      {character.relationship && (
                        <p className="text-xs text-mist-text-secondary/70 mt-2">
                          {character.relationship}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
