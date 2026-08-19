param(
    [string]$OutputPath = "E:\LMS\Relisoft-HR-Portal\relisoft-hr\docs\ReliSoft_HR_Portal_Developer_Runbook.docx",
    [string]$PdfPath = "E:\LMS\Relisoft-HR-Portal\relisoft-hr\docs\qa\ReliSoft_HR_Portal_Developer_Runbook.pdf",
    [string]$ImageDirectory = "E:\LMS\Relisoft-HR-Portal\relisoft-hr\docs\qa\pages"
)

$ErrorActionPreference = "Stop"

function Convert-HexColor([string]$Hex) {
    $clean = $Hex.TrimStart('#')
    $r = [Convert]::ToInt32($clean.Substring(0, 2), 16)
    $g = [Convert]::ToInt32($clean.Substring(2, 2), 16)
    $b = [Convert]::ToInt32($clean.Substring(4, 2), 16)
    return $r + ($g * 256) + ($b * 65536)
}

$Blue = Convert-HexColor "#2E74B5"
$DarkBlue = Convert-HexColor "#1F4D78"
$Navy = Convert-HexColor "#0B2545"
$Muted = Convert-HexColor "#667085"
$Body = Convert-HexColor "#202124"
$TableFill = Convert-HexColor "#E8EEF5"
$LightFill = Convert-HexColor "#F4F6F9"
$CodeFill = Convert-HexColor "#F2F4F7"
$White = Convert-HexColor "#FFFFFF"
$Gold = Convert-HexColor "#7A5A00"

# Word constants
$wdCollapseEnd = 0
$wdPageBreak = 7
$wdAlignLeft = 0
$wdAlignCenter = 1
$wdAlignRight = 2
$wdLineSpaceSingle = 0
$wdLineSpaceMultiple = 5
$wdPaperLetter = 2
$wdOrientPortrait = 0
$wdFormatDocumentDefault = 16
$wdExportFormatPDF = 17
$wdFieldPage = 33
$wdFieldNumPages = 26
$wdPreferredWidthPoints = 3
$wdAdjustNone = 0
$wdCellAlignVerticalCenter = 1
$wdRowHeightAuto = 0
$wdStatisticPages = 2
$wdViewPrint = 3

$word = $null
$doc = $null

function Get-EndRange {
    $end = [Math]::Max(0, $script:doc.Content.End - 1)
    return $script:doc.Range($end, $end)
}

function Set-RunFont($Range, [string]$Name, [double]$Size, [int]$Color, [bool]$Bold = $false, [bool]$Italic = $false) {
    $Range.Font.Name = $Name
    $Range.Font.NameAscii = $Name
    $Range.Font.Size = $Size
    $Range.Font.Color = $Color
    $Range.Font.Bold = if ($Bold) { -1 } else { 0 }
    $Range.Font.Italic = if ($Italic) { -1 } else { 0 }
}

function Add-Paragraph {
    param(
        [string]$Text = "",
        [string]$Style = "Normal",
        [double]$Before = -1,
        [double]$After = -1,
        [int]$Alignment = -1,
        [bool]$Bold = $false,
        [bool]$Italic = $false,
        [double]$Size = 0,
        [int]$Color = -1,
        [bool]$KeepWithNext = $false
    )
    $range = Get-EndRange
    $start = $range.Start
    $range.InsertAfter($Text)
    $paragraph = $script:doc.Range($start, $start + $Text.Length).Paragraphs.Item(1)
    $paragraph.Range.ListFormat.RemoveNumbers()
    $paragraph.Range.Style = $script:doc.Styles.Item($Style)
    if ($Before -ge 0) { $paragraph.Format.SpaceBefore = $Before }
    if ($After -ge 0) { $paragraph.Format.SpaceAfter = $After }
    if ($Alignment -ge 0) { $paragraph.Alignment = $Alignment }
    if ($KeepWithNext) { $paragraph.Format.KeepWithNext = -1 }
    if ($Size -gt 0 -or $Bold -or $Italic -or $Color -ge 0) {
        $fontSize = if ($Size -gt 0) { $Size } else { 11 }
        $fontColor = if ($Color -ge 0) { $Color } else { $script:Body }
        Set-RunFont $paragraph.Range "Calibri" $fontSize $fontColor $Bold $Italic
    }
    $paragraph.Range.InsertParagraphAfter()
    return $paragraph
}

function Add-Heading([string]$Text, [int]$Level) {
    $style = "Heading $Level"
    return Add-Paragraph -Text $Text -Style $style -KeepWithNext $true
}

function Add-Bullet([string]$Text, [int]$Level = 0) {
    $paragraph = Add-Paragraph -Text $Text -After 4
    $paragraph.Range.ListFormat.ApplyBulletDefault()
    $paragraph.Format.LeftIndent = if ($Level -eq 0) { 27 } else { 45 }
    $paragraph.Format.FirstLineIndent = -13.5
    $paragraph.Format.TabStops.ClearAll()
    $paragraph.Format.TabStops.Add($paragraph.Format.LeftIndent)
    $paragraph.Format.LineSpacingRule = $script:wdLineSpaceMultiple
    $paragraph.Format.LineSpacing = 13.75
    return $paragraph
}

function Add-Numbered([string]$Text) {
    $paragraph = Add-Paragraph -Text $Text -After 4
    $paragraph.Range.ListFormat.ApplyNumberDefault()
    $paragraph.Format.LeftIndent = 27
    $paragraph.Format.FirstLineIndent = -13.5
    $paragraph.Format.TabStops.ClearAll()
    $paragraph.Format.TabStops.Add(27)
    $paragraph.Format.LineSpacingRule = $script:wdLineSpaceMultiple
    $paragraph.Format.LineSpacing = 13.75
    return $paragraph
}

function Format-Table($Table, [double[]]$Widths, [bool]$Header = $true, [double]$FontSize = 10) {
    $Table.AllowAutoFit = 0
    $Table.AutoFitBehavior(0)
    $Table.PreferredWidthType = $script:wdPreferredWidthPoints
    $Table.PreferredWidth = 468
    $Table.Rows.LeftIndent = 6
    $Table.TopPadding = 4
    $Table.BottomPadding = 4
    $Table.LeftPadding = 6
    $Table.RightPadding = 6
    $Table.Rows.AllowBreakAcrossPages = 0
    $Table.Rows.HeightRule = $script:wdRowHeightAuto
    $Table.Borders.Enable = 1
    for ($c = 1; $c -le $Widths.Count; $c++) {
        $Table.Columns.Item($c).SetWidth($Widths[$c - 1], $script:wdAdjustNone)
    }
    foreach ($cell in $Table.Range.Cells) {
        $cell.VerticalAlignment = $script:wdCellAlignVerticalCenter
        Set-RunFont $cell.Range "Calibri" $FontSize $script:Body $false $false
        $cell.Range.ParagraphFormat.SpaceBefore = 0
        $cell.Range.ParagraphFormat.SpaceAfter = 2
        $cell.Range.ParagraphFormat.LineSpacingRule = $script:wdLineSpaceSingle
    }
    if ($Header) {
        $Table.Rows.Item(1).HeadingFormat = -1
        $Table.Rows.Item(1).Shading.BackgroundPatternColor = $script:TableFill
        foreach ($cell in $Table.Rows.Item(1).Cells) {
            Set-RunFont $cell.Range "Calibri" 10 $script:Navy $true $false
        }
    }
}

function Add-Table {
    param(
        [object[]]$Rows,
        [double[]]$Widths,
        [bool]$Header = $true,
        [double]$FontSize = 10
    )
    $rowCount = $Rows.Count
    $colCount = $Widths.Count
    $range = Get-EndRange
    $table = $script:doc.Tables.Add($range, $rowCount, $colCount)
    for ($r = 1; $r -le $rowCount; $r++) {
        for ($c = 1; $c -le $colCount; $c++) {
            $table.Cell($r, $c).Range.Text = [string]$Rows[$r - 1][$c - 1]
        }
    }
    Format-Table $table $Widths $Header $FontSize
    $after = $table.Range
    $after.Collapse($script:wdCollapseEnd)
    $after.InsertParagraphAfter()
    return $table
}

function Add-CodeBlock([string]$Code) {
    $range = Get-EndRange
    $table = $script:doc.Tables.Add($range, 1, 1)
    $table.Cell(1, 1).Range.Text = $Code.TrimEnd()
    $table.AllowAutoFit = 0
    $table.AutoFitBehavior(0)
    $table.PreferredWidthType = $script:wdPreferredWidthPoints
    $table.PreferredWidth = 468
    $table.Rows.LeftIndent = 6
    $table.TopPadding = 7
    $table.BottomPadding = 7
    $table.LeftPadding = 9
    $table.RightPadding = 9
    $table.Rows.AllowBreakAcrossPages = 0
    $table.Cell(1, 1).Shading.BackgroundPatternColor = $script:CodeFill
    Set-RunFont $table.Cell(1, 1).Range "Consolas" 9.25 $script:Navy $false $false
    $table.Cell(1, 1).Range.ParagraphFormat.SpaceAfter = 0
    $table.Cell(1, 1).Range.ParagraphFormat.LineSpacingRule = $script:wdLineSpaceSingle
    $after = $table.Range
    $after.Collapse($script:wdCollapseEnd)
    $after.InsertParagraphAfter()
    return $table
}

function Add-Callout([string]$Label, [string]$Text, [string]$Kind = "Note") {
    $range = Get-EndRange
    $table = $script:doc.Tables.Add($range, 1, 1)
    $table.AllowAutoFit = 0
    $table.AutoFitBehavior(0)
    $table.PreferredWidthType = $script:wdPreferredWidthPoints
    $table.PreferredWidth = 468
    $table.Rows.LeftIndent = 6
    $table.TopPadding = 7
    $table.BottomPadding = 7
    $table.LeftPadding = 9
    $table.RightPadding = 9
    $table.Rows.AllowBreakAcrossPages = 0
    $table.Cell(1, 1).Range.Text = "$Label - $Text"
    $table.Cell(1, 1).Range.ListFormat.RemoveNumbers()
    $table.Cell(1, 1).Shading.BackgroundPatternColor = if ($Kind -eq "Warning") { Convert-HexColor "#FFF8E8" } else { $script:LightFill }
    Set-RunFont $table.Cell(1, 1).Range "Calibri" 10 $script:Body $false $false
    $labelLength = $Label.Length
    $labelRange = $script:doc.Range($table.Cell(1, 1).Range.Start, $table.Cell(1, 1).Range.Start + $labelLength)
    $labelRange.Font.Bold = -1
    $labelRange.Font.Color = if ($Kind -eq "Warning") { $script:Gold } else { $script:DarkBlue }
    $table.Cell(1, 1).Range.ParagraphFormat.SpaceAfter = 0
    $tail = Get-EndRange
    $tail.Paragraphs.Item(1).Range.ListFormat.RemoveNumbers()
    $tail.Paragraphs.Item(1).Range.Style = $script:doc.Styles.Item("Normal")
    $tail.Paragraphs.Item(1).Format.LeftIndent = 0
    $tail.Paragraphs.Item(1).Format.FirstLineIndent = 0
    return $table
}

function Add-PageBreak {
    $range = Get-EndRange
    $range.InsertBreak($script:wdPageBreak)
}

try {
    New-Item -ItemType Directory -Path (Split-Path -Parent $OutputPath) -Force | Out-Null
    New-Item -ItemType Directory -Path (Split-Path -Parent $PdfPath) -Force | Out-Null
    New-Item -ItemType Directory -Path $ImageDirectory -Force | Out-Null

    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Add()
    $script:word = $word
    $script:doc = $doc

    $section = $doc.Sections.Item(1)
    $section.PageSetup.PaperSize = $wdPaperLetter
    $section.PageSetup.Orientation = $wdOrientPortrait
    $section.PageSetup.TopMargin = 72
    $section.PageSetup.BottomMargin = 72
    $section.PageSetup.LeftMargin = 72
    $section.PageSetup.RightMargin = 72
    $section.PageSetup.HeaderDistance = 35.4
    $section.PageSetup.FooterDistance = 35.4
    $section.PageSetup.DifferentFirstPageHeaderFooter = -1

    $normal = $doc.Styles.Item("Normal")
    $normal.Font.Name = "Calibri"
    $normal.Font.NameAscii = "Calibri"
    $normal.Font.Size = 11
    $normal.Font.Color = $Body
    $normal.ParagraphFormat.SpaceBefore = 0
    $normal.ParagraphFormat.SpaceAfter = 6
    $normal.ParagraphFormat.LineSpacingRule = $wdLineSpaceMultiple
    $normal.ParagraphFormat.LineSpacing = 13.75

    $h1 = $doc.Styles.Item("Heading 1")
    $h1.Font.Name = "Calibri"
    $h1.Font.NameAscii = "Calibri"
    $h1.Font.Size = 16
    $h1.Font.Bold = -1
    $h1.Font.Color = $Blue
    $h1.ParagraphFormat.SpaceBefore = 18
    $h1.ParagraphFormat.SpaceAfter = 10
    $h1.ParagraphFormat.KeepWithNext = -1

    $h2 = $doc.Styles.Item("Heading 2")
    $h2.Font.Name = "Calibri"
    $h2.Font.NameAscii = "Calibri"
    $h2.Font.Size = 13
    $h2.Font.Bold = -1
    $h2.Font.Color = $Blue
    $h2.ParagraphFormat.SpaceBefore = 14
    $h2.ParagraphFormat.SpaceAfter = 7
    $h2.ParagraphFormat.KeepWithNext = -1

    $h3 = $doc.Styles.Item("Heading 3")
    $h3.Font.Name = "Calibri"
    $h3.Font.NameAscii = "Calibri"
    $h3.Font.Size = 12
    $h3.Font.Bold = -1
    $h3.Font.Color = $DarkBlue
    $h3.ParagraphFormat.SpaceBefore = 10
    $h3.ParagraphFormat.SpaceAfter = 5
    $h3.ParagraphFormat.KeepWithNext = -1

    # Running header and footer (not displayed on cover page).
    $header = $section.Headers.Item(1).Range
    $header.Text = "ReliSoft HR Portal  |  Developer Runbook"
    Set-RunFont $header "Calibri" 9 $Muted $false $false
    $header.ParagraphFormat.Alignment = $wdAlignRight

    $footer = $section.Footers.Item(1).Range
    $footer.Text = "ReliSoft Technologies  |  Developer Runbook  |  Page "
    Set-RunFont $footer "Calibri" 9 $Muted $false $false
    $footer.ParagraphFormat.Alignment = $wdAlignRight
    $footer.Collapse($wdCollapseEnd)
    $doc.Fields.Add($footer, $wdFieldPage) | Out-Null

    # Cover: editorial_cover pattern, adapted as a technical runbook.
    Add-Paragraph -Text "DEVELOPER RUNBOOK" -Before 110 -After 18 -Alignment $wdAlignCenter -Bold $true -Size 11 -Color $Blue | Out-Null
    Add-Paragraph -Text "ReliSoft HR Portal" -After 8 -Alignment $wdAlignCenter -Bold $true -Size 30 -Color $Navy | Out-Null
    Add-Paragraph -Text "Step-by-Step Local Setup, Database Migrations, and Application Startup" -After 28 -Alignment $wdAlignCenter -Size 15 -Color $DarkBlue | Out-Null
    Add-Paragraph -Text "Windows development environment" -After 4 -Alignment $wdAlignCenter -Bold $true -Size 11 -Color $Muted | Out-Null
    Add-Paragraph -Text "Prepared 19 August 2026  |  Repository runbook" -After 76 -Alignment $wdAlignCenter -Italic $true -Size 10 -Color $Muted | Out-Null
    Add-Callout "Outcome" "At the end of this guide, LocalDB is migrated, the .NET API runs on port 5049, the Vite client runs on port 5173, Swagger is available, and a demo login is verified." | Out-Null
    Add-PageBreak

    Add-Heading "1. Overview" 1 | Out-Null
    Add-Paragraph -Text "This runbook is the repeatable local-development procedure for the ReliSoft HR Portal. Run commands from Windows PowerShell or Command Prompt. Examples use the current workspace path; replace it if your clone is stored elsewhere." | Out-Null
    Add-Heading "System at a glance" 2 | Out-Null
    Add-Table -Rows @(
        @("Component", "Local address or resource"),
        @("Frontend", "http://localhost:5173"),
        @("Backend API", "http://localhost:5049"),
        @("Swagger UI", "http://localhost:5049/swagger/index.html"),
        @("Swagger JSON", "http://localhost:5049/swagger/v1/swagger.json"),
        @("Database", "SQL Server LocalDB: RelisoftHRDb"),
        @("Connection", "Server=(localdb)\MSSQLLocalDB; Database=RelisoftHRDb; Integrated Security=true")
    ) -Widths @(135, 333) | Out-Null

    Add-Heading "Prerequisites" 2 | Out-Null
    Add-Bullet "Windows 10 or Windows 11 with SQL Server LocalDB installed." | Out-Null
    Add-Bullet ".NET SDK 10.x. The project targets net10.0." | Out-Null
    Add-Bullet "Entity Framework Core CLI 10.0.9 or a compatible 10.x version." | Out-Null
    Add-Bullet "Node.js and npm. This workspace was verified with Node 24.16.0 and npm 11.13.0." | Out-Null
    Add-Bullet "Git is recommended for cloning, pulling changes, and reviewing migrations." | Out-Null
    Add-Paragraph -Text "Verify the toolchain:" -Bold $true -After 4 | Out-Null
    Add-CodeBlock @"
dotnet --version
dotnet ef --version
node --version
npm.cmd --version
sqllocaldb versions
"@ | Out-Null
    Add-Callout "PowerShell note" "If Windows blocks npm.ps1 with an execution-policy error, use npm.cmd exactly as shown in this guide. No execution-policy change is required." | Out-Null
    Add-Heading "2. First-Time Installation" 1 | Out-Null
    Add-Heading "Step 1 - Open the repository root" 2 | Out-Null
    Add-CodeBlock @"
cd E:\LMS\Relisoft-HR-Portal\relisoft-hr
"@ | Out-Null
    Add-Paragraph -Text "The repository root contains package.json, server, client, README.md, and TECHNICAL.md." | Out-Null

    Add-Heading "Step 2 - Install root JavaScript dependencies" 2 | Out-Null
    Add-CodeBlock @"
npm.cmd install
"@ | Out-Null
    Add-Paragraph -Text "This installs the root development runner, including concurrently, which is used by npm run dev." | Out-Null

    Add-Heading "Step 3 - Restore backend packages" 2 | Out-Null
    Add-CodeBlock @"
dotnet restore server\RelisoftHR.csproj
"@ | Out-Null

    Add-Heading "Step 4 - Install frontend dependencies" 2 | Out-Null
    Add-CodeBlock @"
npm.cmd install --prefix client
"@ | Out-Null

    Add-Heading "Step 5 - Confirm configuration" 2 | Out-Null
    Add-Table -Rows @(
        @("File", "Purpose"),
        @("server/appsettings.json", "LocalDB connection string, JWT settings, CORS, email, and leave policy."),
        @("server/appsettings.Development.json", "Development logging configuration."),
        @("server/Properties/launchSettings.json", "Backend development URL: http://localhost:5049."),
        @("client/vite.config.js", "Frontend dev server and /api proxy to the backend."),
        @("package.json", "Root commands for both services, database update, and builds.")
    ) -Widths @(156, 312) | Out-Null
    Add-Callout "Security" "The checked-in JWT key and demo password are development defaults. Replace secrets through environment variables or secure production configuration before deployment." -Kind "Warning" | Out-Null
    Add-Heading "3. Database Setup and Migrations" 1 | Out-Null
    Add-Heading "Step 1 - Check and start LocalDB" 2 | Out-Null
    Add-CodeBlock @"
sqllocaldb info MSSQLLocalDB
sqllocaldb start MSSQLLocalDB
"@ | Out-Null
    Add-Paragraph -Text "A healthy instance reports State: Running and shows an instance pipe name. Run the application and LocalDB under the same Windows user account." | Out-Null

    Add-Heading "Step 2 - Apply all Entity Framework migrations" 2 | Out-Null
    Add-CodeBlock @"
dotnet ef database update `
  --project server\RelisoftHR.csproj `
  --startup-project server\RelisoftHR.csproj
"@ | Out-Null
    Add-Callout "Expected result" "The command ends with Done. The RelisoftHRDb database and the __EFMigrationsHistory table are created or updated." | Out-Null

    Add-Heading "Step 3 - Inspect migration status" 2 | Out-Null
    Add-CodeBlock @"
dotnet ef migrations list `
  --project server\RelisoftHR.csproj `
  --startup-project server\RelisoftHR.csproj
"@ | Out-Null
    Add-Paragraph -Text "The backend also calls Database.Migrate() during startup, so unapplied migrations are normally applied automatically. Running database update explicitly is recommended on first setup because it surfaces migration errors before the API starts." | Out-Null

    Add-Heading "Creating a new migration" 2 | Out-Null
    Add-CodeBlock @"
dotnet ef migrations add DescriptiveMigrationName `
  --project server\RelisoftHR.csproj `
  --startup-project server\RelisoftHR.csproj

dotnet ef database update `
  --project server\RelisoftHR.csproj `
  --startup-project server\RelisoftHR.csproj
"@ | Out-Null
    Add-Callout "Database safety" "Do not run database drop, delete MDF/LDF files, or recreate a database that may contain user data. Back up first and obtain explicit approval for destructive recovery." -Kind "Warning" | Out-Null
    Add-Heading "4. Start the Application" 1 | Out-Null
    Add-Heading "Option A - Run backend and frontend separately (recommended)" 2 | Out-Null
    Add-Paragraph -Text "Terminal 1 - backend:" -Bold $true -After 4 | Out-Null
    Add-CodeBlock @"
cd E:\LMS\Relisoft-HR-Portal\relisoft-hr
dotnet run --project server\RelisoftHR.csproj
"@ | Out-Null
    Add-Paragraph -Text "Wait for: Now listening on: http://localhost:5049" -Italic $true | Out-Null
    Add-Paragraph -Text "Terminal 2 - frontend:" -Bold $true -After 4 | Out-Null
    Add-CodeBlock @"
cd E:\LMS\Relisoft-HR-Portal\relisoft-hr
npm.cmd run dev --prefix client
"@ | Out-Null
    Add-Paragraph -Text "Wait for Vite to report its Local URL, normally http://localhost:5173." -Italic $true | Out-Null

    Add-Heading "Option B - Run both from one terminal" 2 | Out-Null
    Add-CodeBlock @"
cd E:\LMS\Relisoft-HR-Portal\relisoft-hr
npm.cmd run dev
"@ | Out-Null
    Add-Paragraph -Text "The root dev script uses concurrently and labels the backend and frontend output separately." | Out-Null

    Add-Heading "Stop or restart" 2 | Out-Null
    Add-Bullet "Press Ctrl+C in each terminal to stop a separately launched service." | Out-Null
    Add-Bullet "For the combined runner, press Ctrl+C once and confirm termination if prompted." | Out-Null
    Add-Bullet "After changing C# code, rebuild or allow dotnet run to rebuild. After changing Vite code, hot reload is normally automatic." | Out-Null
    Add-Callout "Port ownership" "Before force-stopping a process, verify its executable and port. Avoid terminating unrelated Node or .NET processes." -Kind "Warning" | Out-Null
    Add-Heading "5. Verify the Running System" 1 | Out-Null
    Add-Heading "Browser checks" 2 | Out-Null
    Add-Numbered "Open http://localhost:5173 and confirm that the ReliSoft login screen loads." | Out-Null
    Add-Numbered "Open http://localhost:5049/swagger/index.html and confirm that Swagger UI lists the API endpoints." | Out-Null
    Add-Numbered "In Swagger, expand POST /api/auth/login, choose Try it out, submit the demo credentials, and confirm HTTP 200." | Out-Null

    Add-Heading "Demo login" 2 | Out-Null
    Add-Table -Rows @(
        @("Username", "Password", "Typical role"),
        @("preeti", "password", "HR L2"),
        @("rakesh", "password", "Organization Head"),
        @("aradhana", "password", "Employee")
    ) -Widths @(120, 120, 228) | Out-Null
    Add-Paragraph -Text "The database must contain the corresponding demo seed data. The preeti account is the recommended first verification account." | Out-Null

    Add-Heading "PowerShell API health check" 2 | Out-Null
    Add-CodeBlock @"
`$body = @{
  username = 'preeti'
  password = 'password'
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri 'http://localhost:5049/api/auth/login' `
  -Method Post `
  -ContentType 'application/json' `
  -Body `$body
"@ | Out-Null
    Add-Callout "Success signal" "A successful response contains the username, employee information, role, permitted views, and a JWT token." | Out-Null

    Add-Heading "Listening-port check" 2 | Out-Null
    Add-CodeBlock @"
Get-NetTCPConnection -State Listen |
  Where-Object { `$_.LocalPort -in 5049, 5173 } |
  Select-Object LocalAddress, LocalPort, OwningProcess
"@ | Out-Null
    Add-Heading "6. Build, Test, and Daily Workflow" 1 | Out-Null
    Add-Heading "Build both applications" 2 | Out-Null
    Add-CodeBlock @"
dotnet build server\RelisoftHR.csproj --no-restore
npm.cmd run build --prefix client
"@ | Out-Null

    Add-Heading "Run automated checks" 2 | Out-Null
    Add-CodeBlock @"
dotnet test server\RelisoftHR.Tests\RelisoftHR.Tests.csproj
npm.cmd run test --prefix client
npm.cmd run lint --prefix client
"@ | Out-Null

    Add-Heading "Recommended workflow after pulling changes" 2 | Out-Null
    Add-Numbered "Open the repository root and review git status so local work is not overwritten." | Out-Null
    Add-Numbered "Restore backend and frontend dependencies if package files changed." | Out-Null
    Add-Numbered "Run dotnet ef database update before starting the API when migrations changed." | Out-Null
    Add-Numbered "Build the backend and frontend." | Out-Null
    Add-Numbered "Start both services and verify Swagger plus the login endpoint." | Out-Null

    Add-Heading "Quick acceptance checklist" 2 | Out-Null
    Add-Bullet "LocalDB MSSQLLocalDB is running." | Out-Null
    Add-Bullet "All EF migrations are applied without errors." | Out-Null
    Add-Bullet "Backend responds on port 5049." | Out-Null
    Add-Bullet "Swagger UI and swagger.json both return HTTP 200." | Out-Null
    Add-Bullet "Frontend responds on port 5173." | Out-Null
    Add-Bullet "preeti / password returns HTTP 200 from POST /api/auth/login." | Out-Null
    Add-Bullet "Backend and frontend builds complete successfully." | Out-Null
    Add-Heading "7. Troubleshooting" 1 | Out-Null
    Add-Heading "LocalDB cannot create or discover MSSQLLocalDB" 2 | Out-Null
    Add-Paragraph -Text "Symptoms include SQL Network Interfaces error 50, Cannot create an automatic instance, or an error reading the LocalDB registry configuration." | Out-Null
    Add-CodeBlock @"
sqllocaldb info
sqllocaldb info MSSQLLocalDB
sqllocaldb start MSSQLLocalDB
"@ | Out-Null
    Add-Bullet "Run the API and LocalDB as the same Windows user." | Out-Null
    Add-Bullet "Confirm the connection string targets (localdb)\MSSQLLocalDB." | Out-Null
    Add-Bullet "Repair SQL Server LocalDB if instance metadata remains inaccessible. Do not delete the database files as a first response." | Out-Null

    Add-Heading "Database update fails on ManagerCode foreign key" 2 | Out-Null
    Add-Paragraph -Text "Use the current repository migrations. They normalize manager references that point to demo employees not yet inserted, recreate the self-reference safely, and assign managers after the referenced employees exist." | Out-Null
    Add-CodeBlock @"
git status
dotnet build server\RelisoftHR.csproj
dotnet ef database update `
  --project server\RelisoftHR.csproj `
  --startup-project server\RelisoftHR.csproj
"@ | Out-Null

    Add-Heading "Invalid column name during startup" 2 | Out-Null
    Add-Paragraph -Text "The application model and database schema are out of sync. Pull the latest migration corrections, rebuild, and apply database update. Never hide this error by removing model properties." | Out-Null

    Add-Heading "Swagger is missing or returns an error" 2 | Out-Null
    Add-Bullet "Use /swagger/index.html, not the older /openapi/v1.json route." | Out-Null
    Add-Bullet "Confirm ASPNETCORE_ENVIRONMENT is Development; Swagger UI is intentionally development-only." | Out-Null
    Add-Bullet "Rebuild and restart the backend after changing Program.cs or package references." | Out-Null
    Add-Heading "Troubleshooting (continued)" 1 | Out-Null
    Add-Heading "npm.ps1 is blocked" 2 | Out-Null
    Add-Paragraph -Text "Use npm.cmd in PowerShell:" | Out-Null
    Add-CodeBlock @"
npm.cmd install
npm.cmd run dev --prefix client
"@ | Out-Null

    Add-Heading "Port 5049 or 5173 is already in use" 2 | Out-Null
    Add-CodeBlock @"
Get-NetTCPConnection -State Listen |
  Where-Object { `$_.LocalPort -in 5049, 5173 } |
  Select-Object LocalPort, OwningProcess

Get-Process -Id <OwningProcess>
"@ | Out-Null
    Add-Paragraph -Text "Stop the existing ReliSoft process cleanly with Ctrl+C. Use Stop-Process only after confirming that the PID belongs to this project." | Out-Null

    Add-Heading "Frontend shows Failed to fetch" 2 | Out-Null
    Add-Bullet "Confirm the backend is running on http://localhost:5049." | Out-Null
    Add-Bullet "Confirm client/vite.config.js proxies /api requests to port 5049." | Out-Null
    Add-Bullet "Check the backend terminal for SQL, migration, or seeding errors." | Out-Null

    Add-Heading "Windows Event Log access error" 2 | Out-Null
    Add-Paragraph -Text "Development configuration disables the Windows Event Log provider. Confirm server/appsettings.Development.json is present and ASPNETCORE_ENVIRONMENT is Development." | Out-Null

    Add-Heading "8. Command Reference" 1 | Out-Null
    Add-Table -Rows @(
        @("Task", "Command"),
        @("Install root", "npm.cmd install"),
        @("Restore backend", "dotnet restore server\RelisoftHR.csproj"),
        @("Install client", "npm.cmd install --prefix client"),
        @("Apply migrations", "npm.cmd run database-update"),
        @("Run both", "npm.cmd run dev"),
        @("Run backend", "dotnet run --project server\RelisoftHR.csproj"),
        @("Run frontend", "npm.cmd run dev --prefix client"),
        @("Build all", "npm.cmd run build"),
        @("Swagger", "http://localhost:5049/swagger/index.html")
    ) -Widths @(135, 333) -FontSize 9.5 | Out-Null

    Add-Callout "Ready" "When all acceptance checks pass, keep both service terminals open and develop against http://localhost:5173. Use Swagger to inspect and exercise backend endpoints." | Out-Null

    # Keep Word's required final paragraph after the last table from creating an
    # otherwise blank trailing page.
    $lastParagraph = $doc.Paragraphs.Item($doc.Paragraphs.Count)
    $lastParagraph.Range.Font.Size = 1
    $lastParagraph.Format.SpaceBefore = 0
    $lastParagraph.Format.SpaceAfter = 0
    $lastParagraph.Format.LineSpacingRule = $wdLineSpaceSingle

    $doc.Fields.Update() | Out-Null
    $doc.Repaginate()
    $doc.SaveAs2($OutputPath, $wdFormatDocumentDefault)
    $doc.ExportAsFixedFormat($PdfPath, $wdExportFormatPDF)

    # Native Word page render: export each paginated page as an enhanced metafile,
    # then rasterize it to PNG for visual QA.
    $word.ActiveWindow.View.Type = $wdViewPrint
    $doc.Repaginate()
    $pageCount = $doc.ComputeStatistics($wdStatisticPages)
    $pages = $word.ActiveWindow.Panes.Item(1).Pages
    Add-Type -AssemblyName System.Drawing
    for ($i = 1; $i -le $pageCount; $i++) {
        $page = $pages.Item($i)
        [byte[]]$emfBytes = $page.EnhMetaFileBits
        $emfPath = Join-Path $ImageDirectory ("page-{0:D2}.emf" -f $i)
        $pngPath = Join-Path $ImageDirectory ("page-{0:D2}.png" -f $i)
        [IO.File]::WriteAllBytes($emfPath, $emfBytes)
        $sourceImage = [System.Drawing.Image]::FromFile($emfPath)
        $bitmap = New-Object System.Drawing.Bitmap 1224, 1584
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($sourceImage, 0, 0, 1224, 1584)
        $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $graphics.Dispose()
        $bitmap.Dispose()
        $sourceImage.Dispose()
    }

    Write-Output "DOCX=$OutputPath"
    Write-Output "PDF=$PdfPath"
    Write-Output "PAGES=$pageCount"
    Write-Output "PNG_DIR=$ImageDirectory"
}
finally {
    if ($doc -ne $null) { $doc.Close($false) }
    if ($word -ne $null) { $word.Quit() }
    if ($doc -ne $null) { [Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null }
    if ($word -ne $null) { [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
