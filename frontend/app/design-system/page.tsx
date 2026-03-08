import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background p-12 mt-0">
      <div className="mx-auto max-w-6xl space-y-16">
        <div>
          <h1 className="text-4xl font-bold text-text-strong">Animita Design System</h1>
          <p className="mt-2 text-lg text-text-weak">Colors, Typography, Components & Patterns</p>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-semibold text-text-strong">Colors</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-background border border-border"></div>
              <p className="text-sm font-medium">background</p>
              <p className="text-xs text-text-weak">#FCFCFC</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-background-weak border border-border"></div>
              <p className="text-sm font-medium">background-weak</p>
              <p className="text-xs text-text-weak">#F2F2F2</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-background-weaker border border-border"></div>
              <p className="text-sm font-medium">background-weaker</p>
              <p className="text-xs text-text-weak">#E8E8E8</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-accent border border-border"></div>
              <p className="text-sm font-medium">accent</p>
              <p className="text-xs text-text-weak">#0000EE</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-destructive border border-border"></div>
              <p className="text-sm font-medium">destructive</p>
              <p className="text-xs text-text-weak">Error/Red</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-border border-2 border-border"></div>
              <p className="text-sm font-medium">border</p>
              <p className="text-xs text-text-weak">#CFCECC</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-semibold text-text-strong">Typography</h2>
          <div className="space-y-6">
            <div>
              <p className="text-4xl font-bold text-text-strong">Display Large - text-4xl bold</p>
              <p className="mt-1 text-xs text-text-weak">36px, font-weight: 700</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-text-strong">Heading 1 - text-3xl bold</p>
              <p className="mt-1 text-xs text-text-weak">30px, font-weight: 700</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-text-strong">Heading 2 - text-2xl semibold</p>
              <p className="mt-1 text-xs text-text-weak">24px, font-weight: 600</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-text-strong">Heading 3 - text-xl semibold</p>
              <p className="mt-1 text-xs text-text-weak">20px, font-weight: 600</p>
            </div>
            <div>
              <p className="text-lg font-medium text-text-strong">Body Large - text-lg medium</p>
              <p className="mt-1 text-xs text-text-weak">18px, font-weight: 500</p>
            </div>
            <div>
              <p className="text-base font-normal text-text-strong">Body Regular - text-base normal</p>
              <p className="mt-1 text-xs text-text-weak">16px, font-weight: 400</p>
            </div>
            <div>
              <p className="text-sm font-normal text-text">Body Small - text-sm normal</p>
              <p className="mt-1 text-xs text-text-weak">14px, font-weight: 400</p>
            </div>
            <div>
              <p className="text-xs font-normal text-text-weak">Label Extra Small - text-xs normal</p>
              <p className="mt-1 text-xs text-text-weak">12px, font-weight: 400</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-semibold text-text-strong">Buttons</h2>
          <div className="grid gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-weak">Default Variant</p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-weak">Secondary Variant</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm">Small</Button>
                <Button variant="secondary" size="default">Default</Button>
                <Button variant="secondary" size="lg">Large</Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-weak">Outline Variant</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">Small</Button>
                <Button variant="outline" size="default">Default</Button>
                <Button variant="outline" size="lg">Large</Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-weak">Ghost Variant</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" size="sm">Small</Button>
                <Button variant="ghost" size="default">Default</Button>
                <Button variant="ghost" size="lg">Large</Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-weak">Destructive Variant</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="destructive" size="sm">Small</Button>
                <Button variant="destructive" size="default">Default</Button>
                <Button variant="destructive" size="lg">Large</Button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-semibold text-text-strong">Badges</h2>
          <div className="grid gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-weak">Default</p>
              <div className="flex flex-wrap gap-2">
                <Badge>Badge</Badge>
                <Badge>Default</Badge>
                <Badge>Primary</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-weak">Secondary</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="secondary">Label</Badge>
                <Badge variant="secondary">Tag</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-weak">Outline</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Outline</Badge>
                <Badge variant="outline">Border</Badge>
                <Badge variant="outline">Stroke</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-weak">Destructive</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="destructive">Error</Badge>
                <Badge variant="destructive">Warning</Badge>
                <Badge variant="destructive">Danger</Badge>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-semibold text-text-strong">Inputs & Forms</h2>
          <div className="space-y-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="text-input">Text Input</Label>
              <Input id="text-input" placeholder="Enter text..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled-input">Disabled Input</Label>
              <Input id="disabled-input" placeholder="Disabled..." disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-input">Search Input</Label>
              <Input id="search-input" type="search" placeholder="Search..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-input">Email Input</Label>
              <Input id="email-input" type="email" placeholder="email@example.com" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-semibold text-text-strong">Cards</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text">This is the card content area with your main information.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Another Card</CardTitle>
                <CardDescription>With different content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm">Action 1</Button>
                  <Button variant="secondary" size="sm">Action 2</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-semibold text-text-strong">Spacing Scale</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm text-text-weak">space-1 (4px)</span>
              <div className="h-6 bg-accent" style={{ width: '4px' }}></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm text-text-weak">space-2 (8px)</span>
              <div className="h-6 bg-accent" style={{ width: '8px' }}></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm text-text-weak">space-3 (12px)</span>
              <div className="h-6 bg-accent" style={{ width: '12px' }}></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm text-text-weak">space-4 (16px)</span>
              <div className="h-6 bg-accent" style={{ width: '16px' }}></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm text-text-weak">space-6 (24px)</span>
              <div className="h-6 bg-accent" style={{ width: '24px' }}></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm text-text-weak">space-8 (32px)</span>
              <div className="h-6 bg-accent" style={{ width: '32px' }}></div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-semibold text-text-strong">Border Radius</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="h-24 rounded-sm bg-background-weak border border-border"></div>
              <p className="text-xs font-medium">rounded-sm</p>
              <p className="text-xs text-text-weak">6px</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-md bg-background-weak border border-border"></div>
              <p className="text-xs font-medium">rounded-md</p>
              <p className="text-xs text-text-weak">8px</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-background-weak border border-border"></div>
              <p className="text-xs font-medium">rounded-lg</p>
              <p className="text-xs text-text-weak">10px</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-xl bg-background-weak border border-border"></div>
              <p className="text-xs font-medium">rounded-xl</p>
              <p className="text-xs text-text-weak">14px</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
