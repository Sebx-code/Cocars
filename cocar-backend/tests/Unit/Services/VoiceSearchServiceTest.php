<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\VoiceSearchService;

class VoiceSearchServiceTest extends TestCase
{
    private VoiceSearchService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new VoiceSearchService();
    }

    /**
     * Test basique du parsing d'une phrase vocale
     */
    public function testParseSimpleVoiceQuery()
    {
        $phrase = "je recherche un trajet douala yaounde demain a 16h j'ai 4000";

        $result = $this->service->parseSearchQuery($phrase);

        $this->assertEquals('Douala', $result['departure']);
        $this->assertEquals('Yaoundé', $result['destination']);
        $this->assertEquals('16:00', $result['time']);
        $this->assertEquals(4000, $result['budget']);
        $this->assertNotNull($result['date']);
    }

    /**
     * Test avec accents et variantes de villes
     */
    public function testParseWithCityVariants()
    {
        $phrase = "ydé douala demain 14h30 budget 3000";

        $result = $this->service->parseSearchQuery($phrase);

        $this->assertEquals('Douala', $result['departure']);
        $this->assertEquals('Yaoundé', $result['destination']);
        $this->assertEquals('14:30', $result['time']);
        $this->assertEquals(3000, $result['budget']);
    }

    /**
     * Test extraction du budget avec variantes
     */
    public function testExtractBudgetVariants()
    {
        $phrases = [
            "douala yaounde j'ai 5000" => 5000,
            "douala yaounde j ai 5000" => 5000,
            "douala yaounde prix 5000" => 5000,
            "douala yaounde budget 5000" => 5000,
            "douala yaounde 5000 francs" => 5000,
            "douala yaounde payer 5000" => 5000,
        ];

        foreach ($phrases as $phrase => $expectedBudget) {
            $result = $this->service->parseSearchQuery($phrase);
            $this->assertEquals($expectedBudget, $result['budget'],
                "Failed for phrase: $phrase");
        }
    }

    /**
     * Test extraction de l'heure
     */
    public function testExtractTimeVariants()
    {
        $phrases = [
            "douala yaounde 16h" => '16:00',
            "douala yaounde 16h30" => '16:30',
            "douala yaounde 16:30" => '16:30',
            "douala yaounde a 16h" => '16:00',
            "douala yaounde à 16:45" => '16:45',
        ];

        foreach ($phrases as $phrase => $expectedTime) {
            $result = $this->service->parseSearchQuery($phrase);
            $this->assertEquals($expectedTime, $result['time'],
                "Failed for phrase: $phrase");
        }
    }

    /**
     * Test extraction de la date avec keywords
     */
    public function testExtractDateKeywords()
    {
        $result = $this->service->parseSearchQuery("douala yaounde demain 16h");
        $this->assertNotNull($result['date']);
    }

    /**
     * Test validation des paramètres
     */
    public function testValidateParams()
    {
        // Cas valide
        $validParams = [
            'departure' => 'Douala',
            'destination' => 'Yaoundé',
            'date' => '2026-04-10',
            'time' => '16:00',
            'budget' => 4000,
        ];

        $errors = $this->service->validate($validParams);
        $this->assertEmpty($errors);

        // Cas: même ville départ et arrivée
        $invalidParams = $validParams;
        $invalidParams['destination'] = 'Douala';

        $errors = $this->service->validate($invalidParams);
        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('différentes', $errors[0]);

        // Cas: pas de départ
        $invalidParams = $validParams;
        $invalidParams['departure'] = null;

        $errors = $this->service->validate($invalidParams);
        $this->assertNotEmpty($errors);
    }

    /**
     * Test conversion en paramètres de query
     */
    public function testConvertToQueryParams()
    {
        $params = [
            'departure' => 'Douala',
            'destination' => 'Yaoundé',
            'date' => '2026-04-10',
            'time' => '16:00',
            'budget' => 4000,
        ];

        $queryParams = $this->service->toQueryParams($params);

        $this->assertEquals('Douala', $queryParams['departure_city']);
        $this->assertEquals('Yaoundé', $queryParams['arrival_city']);
        $this->assertEquals('2026-04-10', $queryParams['date']);
        $this->assertEquals('16:00', $queryParams['departure_time']);

        // Budget avec tolérance 20%
        // min = 4000 * 0.8 = 3200
        // max = 4000 * 1.2 = 4800
        $this->assertEquals(3200, $queryParams['min_price']);
        $this->assertEquals(4800, $queryParams['max_price']);
    }

    /**
     * Test avec phrases complexes et bruyantes
     */
    public function testParseComplexPhrase()
    {
        $phrase = "Salut, je voudrais trouver un trajet de Douala vers Yaoundé, "
                . "demain à 16h30 si possible. J'ai un budget de 3500 francs.";

        $result = $this->service->parseSearchQuery($phrase);

        $this->assertEquals('Douala', $result['departure']);
        $this->assertEquals('Yaoundé', $result['destination']);
        $this->assertEquals('16:30', $result['time']);
        $this->assertEquals(3500, $result['budget']);
    }

    /**
     * Test avec des villes non reconnues
     */
    public function testParseWithUnknownCities()
    {
        $phrase = "je recherche un trajet paris london demain";

        $result = $this->service->parseSearchQuery($phrase);

        $this->assertNull($result['departure']);
        $this->assertNull($result['destination']);
    }

    /**
     * Test cas limites: heure invalide
     */
    public function testParseInvalidTime()
    {
        $phrase = "douala yaounde 25h";

        $result = $this->service->parseSearchQuery($phrase);

        // L'heure ne devrait pas être extraite
        $this->assertNull($result['time']);
    }

    /**
     * Test cas limites: prix négatif ou zéro
     */
    public function testParseBudget()
    {
        $phrase = "douala yaounde j'ai 0";

        $result = $this->service->parseSearchQuery($phrase);

        // Même 0 est extrait (validation à niveau plus haut)
        $this->assertEquals(0, $result['budget']);
    }
}
